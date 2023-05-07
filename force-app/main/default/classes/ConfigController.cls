/*
	Name : ConfigController
	Date : 07-May-2023
	Desc : Perform DML,SOQL and REST callout logic related to config, caseConfig and case object 
*/
public with sharing class ConfigController {
    
	// Return all the config records 
    @AuraEnabled(cacheable=true)
    public static List<Config__c> getAllConfigRecords(){
        List<Config__c> configList = new List<Config__c>();
        try {
            configList = [SELECT Id, Label__c, Type__c, Amount__c FROM Config__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return configList;
    }
    //Return all caseConfig records based on case Id;
    @AuraEnabled(cacheable=true)
    public static List<Case_Config__c> getAllCaseConfigRecords(String caseId){
        List<Case_Config__c> caseConfigList = new List<Case_Config__c>();
        try {
            if(String.isNotBlank(caseId)){
                caseConfigList = [SELECT Id, Label__c, Type__c, Amount__c, Case__c FROM Case_Config__c WHERE Case__c =: caseId];
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return caseConfigList;
    }
    //Perform insert operation on caseConfig object 
    @AuraEnabled
    public static string insertCaseConfig(String caseId, List<Config__c> configList){
        String returnString = '';
        try {        
            List<case> caseList = [SELECT Id,Status FROM Case WHERE Id =: caseId];
            if(caseList.size() > 0 && caseList[0].Status != 'Closed'){
                if(configList.size() > 0){            
                    List<Case_Config__c> newCaseConfigList = new List<Case_Config__c>();
                    List<String> labelList = new List<String>();

                    for(Case_Config__c ccObj : [SELECT Label__c FROM Case_Config__c WHERE Case__c =: caseId]){
                        labelList.add(ccObj.Label__c);
                    }

                    for(Config__c configObj : configList){
                        if(!labelList.contains(configObj.Label__c)){
                            Case_Config__c caseConfigObj = new Case_Config__c();
                            caseConfigObj.Label__c = configObj.Label__c;
                            caseConfigObj.Type__c = configObj.Type__c;
                            caseConfigObj.Amount__c = configObj.Amount__c;
                            caseConfigObj.Case__c = caseId;
                            newCaseConfigList.add(caseConfigObj);
                        }
                    }

                    if(newCaseConfigList.size() > 0){
                        Database.insert(newCaseConfigList);
                        if(newCaseConfigList.size() == configList.size()){
                            returnString = '0';
                        }else{
                            returnString = '1';
                        }
                    }else{
                        returnString = '2';
                    }               
                }
            }else{
                returnString = '3';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return returnString;
    }
    //Handle caseId and requestBody and perform HTTP rest callout to external system and return callout status
    @AuraEnabled
    public static string sendRequest(String caseId, String requestBody){
        String responseMessage = '';
        try {
            List<case> caseList = [SELECT Id,Status FROM Case WHERE Id =: caseId];
            if(caseList.size() > 0 && caseList[0].Status != 'Closed'){
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint('callout:requestCatcherEndPoint');
                request.setMethod('POST');
                request.setHeader('Content-Type', 'application/json');
                request.setBody(requestBody);
                HttpResponse response = http.send(request);
                if (response.getStatusCode() == 200) {
                    caseList[0].Status = 'Closed';
                    Database.update(caseList);
                    responseMessage = '200';
               }else{
                responseMessage = 'Request failed with status code ' + response.getStatusCode() + ': ' + response.getStatus();
               }
            }else{
                responseMessage = '0';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return responseMessage;
    }
}