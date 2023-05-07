import { LightningElement, api, wire } from 'lwc';
import { subscribe, unsubscribe, createMessageContext, releaseMessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCaseConfigData from '@salesforce/apex/ConfigController.getAllCaseConfigRecords';
import sendRequest from '@salesforce/apex/ConfigController.sendRequest';
import Notification from "@salesforce/messageChannel/notificationMessageChannel__c";
import RequestSentSuccess from '@salesforce/label/c.ccRequestSentSuccess';
import CaseClosedRequestSent from '@salesforce/label/c.ccCaseClosedRequestSent';
import NoRecords from '@salesforce/label/c.ccNoRecords';
export default class CaseConfigRelatedList extends LightningElement {
    @api recordId;

    dataList = [];
    columnsList = [
        { label: 'Label', fieldName: 'Label__c', type: 'text', sortable: true },
        { label: 'Type', fieldName: 'Type__c', type: 'text', sortable: true },
        { label: 'Amount', fieldName: 'Amount__c', type: 'number', sortable: true }
    ];
    labels = {
        RequestSentSuccess,
        CaseClosedRequestSent,
        NoRecords
    }
    subscription = null;
    caseConfigDataList;
    showTable = false;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    connectedCallback() {
        this.subscribeMC();
    }

    context = createMessageContext();

    @wire(getCaseConfigData, { caseId: '$recordId' })
    caseConfigWiredData(value) {
        this.caseConfigDataList = value;
        let { data, error } = value;
        if (data && data.length > 0) {
            this.showTable = true;
            console.log('Data', data);
            this.dataList = data;
        } else if (error) {
            console.error('Error:', error);
            this.showToast('Error', error.body.message, 'error');
        }
    }

    updateRecordView(recordId) {
        updateRecord({ fields: { Id: recordId } });
    }

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, Notification, (message) => {
            refreshApex(this.caseConfigDataList);
        });
    }

    handleSendBtn() {
        let requestBody = {
            "caseId": this.recordId,
            "status": "Closed",
            "caseConfigs": []
        }
        let caseConfigs = [];
        if (this.dataList.length > 0) {
            this.dataList.forEach(ele => {
                caseConfigs.push({
                    "label": ele.Label__c,
                    "type": ele.Type__c,
                    "amount": ele.Amount__c
                })
            });
            requestBody.caseConfigs = caseConfigs;
            this.sendRequestCaseConfigData(requestBody);
        }
    }

    sendRequestCaseConfigData(requestBody) {
        sendRequest({
            caseId: this.recordId,
            requestBody: JSON.stringify(requestBody),
        }).then(res => {
            if (res == '200') {
                this.showToast('Success', this.labels.RequestSentSuccess, 'success');
                this.updateRecordView(this.recordId);
            } else if (res == '0') {
                this.showToast('Error', this.labels.CaseClosedRequestSent, 'error');
            } else {
                this.showToast('Error', res, 'error');
            }
        }).catch(err => {
            console.error('Error:', err);
            this.showToast('Error', err.body.message, 'error');
        })
    }

    showToast(title, msg, type) {
        const event = new ShowToastEvent({
            title: title,
            message: msg,
            variant: type
        });
        this.dispatchEvent(event);
    }

    sortBy(field, reverse, primer) {
        const key = primer ?
            function (x) {
                return primer(x[field]);
            } :
            function (x) {
                return x[field];
            };

        return function (a, b) {
            return a = key(a) ? key(a) : '', b = key(b) ? key(b) : '', reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.dataList];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.dataList = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

}