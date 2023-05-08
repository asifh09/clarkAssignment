## All Config and Case Config
As per the requirements we need to create two related list which will use at case detail page.

## Requirement
1. "Available Configs" first list show all Configs records which are coming from config custom object.
2. "Case Configs" second related will show the case configs records which are related to the case records.

## Break Down
As per the requirement, I break these down into two LWC individual components so these two components can run individually, and I create one LMS (lighting message service) to communicate between these two components. And created one apex class controller to perform the DML, SOQL, and REST callouts and handle the other logic.

1. First component for "Available Configs". Component name is configRelatedList
2. Second for "Case Configs".  Component name is caseConfigRelatedList
3. LMS to communicate between these component. LMS name is  NotificationMessageChannel
4. Apex class controlle. Name is ConfigController.
5. Used namedCredentials to whitelist the URL and use dynamically in apex for http callout  

## Instruction
This repository includes all the relevant metadata and components, like LWC, Apex classes, and case flexi pages. You can deploy the repository in your Salesforce org by cloning it in Visual Studio code. Once it has been properly deployed, you can run the components to verify their functionality. 

<b>You can find all the metadata information below.</b>

- LWC component
    - caseConfigRelatedList
    - configRelatedList
- LMS
    - NotificationMessageChannel
- Apex
    - ConfigController
    - ConfigControllerTest
    - MockHttpResponseGenerator
- Custom Object
    - Case_Config__c
    - Config__c
- Custom Tab
    - Case_Config__c.tab
    - Config__c.tab
- Page Layout
    - Case_Config__c-Case Config Layout.layout
    - Config__c-Config Layout.layout
- Flexipages
    - Case_Record_Page.flexipage
-Profile
    - Admin
- CustomApplication(Lighting App)    
    - Config.app
- Custom Labels
    - ccAllDuplicate
    - ccCaseClosedConfig
    - ccCaseClosedRequestSent
    - ccNoRecords
    - ccRecordsInserted
    - ccRequestSentSuccess
    - ccSelectRow
    - ccSomeDuplicate
- NamedCredentials
    - requestCatcherEndPoint.namedCredential
