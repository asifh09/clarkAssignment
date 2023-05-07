/*
	Name : ConfigControllerTest
	Date : 07-May-2023
	Desc : Test class of ConfigController
*/
@isTest
public class ConfigControllerTest {
	@testSetup static void setup() {        
        List<Config__c> configList = new List<Config__c>();        
        Config__c configObj1 = new Config__c();
        configObj1.Label__c = 'Config Level 1';
        configObj1.Type__c = 'C';
        configObj1.Amount__c = 10;
        configList.add(configObj1);
        
        Config__c configObj2 = new Config__c();
        configObj2.Label__c = 'Config Level 2';
        configObj2.Type__c = 'B';
        configObj2.Amount__c = 20;
        configList.add(configObj2);
        
        Config__c configObj3 = new Config__c();
        configObj3.Label__c = 'Config Level 3';
        configObj3.Type__c = 'A';
        configObj3.Amount__c = 30;
        configList.add(configObj3);
        
        insert configList;
        
        Case testCase = new Case();
        testCase.Status = 'Open';
        insert testCase;
        
        Case_Config__c caseConfig = new Case_Config__c();
        caseConfig.Label__c = 'Test Case Config 1';
        caseConfig.Type__c = 'Type 3';
        caseConfig.Amount__c =  10;
        caseConfig.Case__c = testCase.Id;
        insert caseConfig;
        
    }
    
    @isTest
    static void testGetAllConfigRecords() {
        Test.startTest();
        List<Config__c> returnedConfigList = ConfigController.getAllConfigRecords();
        Test.stopTest();
        System.assertEquals(returnedConfigList.size(), 3, 'size should be 3');
    }
    
    @isTest
    static void testGetAllCaseConfigRecords() {
        case caseObj = [SELECT Id FROM Case LIMIT 1];
        Test.startTest();
        List<Case_Config__c> returnedCaseConfigList  = ConfigController.getAllCaseConfigRecords(caseObj.Id);
        Test.stopTest();
        System.assertEquals(returnedCaseConfigList.size(), 1, 'size should be 1');
    }
    
    @isTest
    static void testInsertCaseConfig() {
        case caseObj = [SELECT Id FROM Case LIMIT 1];
        List<Config__c> configList = [SELECT Label__c, Type__c, Amount__c FROM Config__c WHERE Label__c = 'Config Level 1'];
        Test.startTest();
        String response = ConfigController.insertCaseConfig(caseObj.Id,configList); 
        
        configList = [SELECT Label__c, Type__c, Amount__c FROM Config__c WHERE Label__c IN ('Config Level 1','Config Level 2') ];
        response = ConfigController.insertCaseConfig(caseObj.Id,configList);
        response = ConfigController.insertCaseConfig(caseObj.Id,configList);
        
        caseObj.Status = 'Closed';
        update caseObj;       
        response = ConfigController.insertCaseConfig(caseObj.Id,configList);       
        Test.stopTest();
        System.assertEquals(response, '3', 'return should be 3');
    } 
    
    @isTest
    static void testSendRequestMethod1() {
        case caseObj = [SELECT Id FROM Case LIMIT 1];
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        String requestBody = '{"caseId": "50068000005QOhbAAG","status": "Closed","caseConfigs": [{"label": "Test Label","type": "Test Type","amount": 10.00 }]}';
        ConfigController.sendRequest(caseObj.Id, requestBody);
        ConfigController.sendRequest(caseObj.Id, requestBody);
        Test.stopTest();
    }      
    
    @isTest
    static void testSendRequestMethod2() {
        case caseObj = [SELECT Id FROM Case LIMIT 1];
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        String requestBody = 'abc';
        ConfigController.sendRequest(caseObj.Id, requestBody);        
        Test.stopTest();
    }      
}