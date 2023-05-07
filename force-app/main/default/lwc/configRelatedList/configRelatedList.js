import { LightningElement, api, wire } from 'lwc';
import { publish, createMessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getConfigDataFromApex from '@salesforce/apex/ConfigController.getAllConfigRecords';
import insertConfigRecords from '@salesforce/apex/ConfigController.insertCaseConfig';
import Notification from "@salesforce/messageChannel/notificationMessageChannel__c";
import SelectRow from '@salesforce/label/c.ccSelectRow';
import RecordsInserted from '@salesforce/label/c.ccRecordsInserted';
import SomeDuplicate from '@salesforce/label/c.ccSomeDuplicate';
import AllDuplicate from '@salesforce/label/c.ccAllDuplicate';
import CaseClosedConfig from '@salesforce/label/c.ccCaseClosedConfig';
import NoRecords from '@salesforce/label/c.ccNoRecords';
export default class ConfigRelatedList extends LightningElement {
    @api recordId;
    columnsList = [
        { label: 'Label', fieldName: 'Label__c', type: 'text', sortable: true },
        { label: 'Type', fieldName: 'Type__c', type: 'text', sortable: true },
        { label: 'Amount', fieldName: 'Amount__c', type: 'number', sortable: true },
    ];
    dataList = [];
    recordsNeedsToAdd = [];
    dataToShow = [];
    labels = {
        SelectRow,
        RecordsInserted,
        SomeDuplicate,
        AllDuplicate,
        CaseClosedConfig,
        NoRecords
    }
    showTable = false;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    currentPage = 0;
    startRecordIndex = 0;
    endRecordIndex = 0;
    pageSizeDefault = 10;
    totalPages;
    context = createMessageContext();

    @wire(getConfigDataFromApex)
    configWiredData({ error, data }) {
        if (data && data.length > 0) {
            console.log('Data', data);
            this.showTable = true;
            this.dataList = data;
            this.setTablePagination();
        } else if (error) {
            console.error('Error:', error);
            this.showToast('Error', error.body.message, 'error');
        }
    }

    get getCurrentPage() {
        return this.currentPage + 1;
    }

    get disabledPrevious() {
        return this.startRecordIndex == 0 ? true : false;
    }
    
    get disabledNext() {
        return this.currentPage + 1 == this.totalPages ? true : false;
    }

    handleRowSelectionAction(evt) {
        console.log(evt);
        this.recordsNeedsToAdd = evt.detail.selectedRows;
    }

    handleAddBtn() {
        if (this.recordsNeedsToAdd.length > 0) {
            this.insertCaseConfigData();
        } else {
            this.showToast('Error', this.labels.SelectRow, 'error');
        }
    }

    insertCaseConfigData() {
        insertConfigRecords({
            caseId: this.recordId,
            configList: this.recordsNeedsToAdd
        }).then(res => {
            console.log(res);
            if (res == '0') {
                this.showToast('Success', this.labels.RecordsInserted, 'success');
                this.publishMC();
            } else if (res == '1') {
                this.showToast('Warning', this.labels.SomeDuplicate, 'warning');
                this.publishMC();
            } else if (res == '2') {
                this.showToast('Error', this.labels.AllDuplicate, 'error');
            } else if (res == '3') {
                this.showToast('Error', this.labels.CaseClosedConfig, 'error');
            }
        }).catch(err => {
            console.log(err);
            this.showToast('Error', err.body.message, 'error');
        });
    }

    showToast(title, msg, type) {
        const event = new ShowToastEvent({
            title: title,
            message: msg,
            variant: type
        });
        this.dispatchEvent(event);
    }

    publishMC() {
        publish(this.context, Notification, null);
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
        const cloneData = [...this.dataToShow];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.dataToShow = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    setTablePagination() {
        if (this.dataList.length > 0) {
            let pageList = JSON.parse(JSON.stringify(this.dataList));
            let newList = new Array();
            this.currentPage = 0;
            this.startRecordIndex = 0;
            this.endRecordIndex = this.pageSizeDefault - 1;
            for (let i = 0; i < this.pageSizeDefault; i++) {
                if (this.dataList.length > i) {
                    newList.push(JSON.parse(JSON.stringify(pageList[i])));
                }
            }
            this.dataToShow = newList;
            console.log('records', this.dataToShow);
            this.totalPages = Math.ceil(this.dataList.length / this.pageSizeDefault);
        }
    }

    previousHandler() {
        let counter = 0;
        let newList = new Array();
        for (let i = this.startRecordIndex - this.pageSizeDefault;
            i < this.startRecordIndex; i++) {
            if (i > -1) {
                newList.push(JSON.parse(JSON.stringify(this.dataList[i])));
                counter++;
            } else {
                this.startRecordIndex++;
            }
        }
        this.dataToShow = newList;
        this.startRecordIndex = this.startRecordIndex - counter;
        this.endRecordIndex = this.endRecordIndex - counter;
        this.currentPage--;
    }

    nextHandler() {
        let counter = 0;
        let newList = new Array();
        let numberOfRec = parseInt(this.pageSizeDefault) +
            parseInt(this.endRecordIndex) + 1;
        for (let i = this.endRecordIndex + 1; i < numberOfRec; i++) {
            if (this.dataList.length > i) {
                newList.push(JSON.parse(JSON.stringify(this.dataList[i])));
            }
            counter++;
        }
        this.startRecordIndex = this.startRecordIndex + counter;
        this.endRecordIndex = this.endRecordIndex + counter;
        this.currentPage++;
        this.dataToShow = newList;
    }
}