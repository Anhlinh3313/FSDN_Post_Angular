import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Subject, Observable } from 'rxjs';

interface VersionModel {
    version: string;
    hash: string;
}

@Injectable()
export class VersionCheckService {
    // this will be replaced by actual hash post-build.js
    currentHash = '61f608cdc4245f7cd4e3';
    message: string = "Hệ thống TMS đang cập nhật version mới. Vui lòng chờ trong giây lát...";

    constructor(private http: Http) {}

    subject = new Subject<any>();

    sendMessage(message: string) {
        this.subject.next({ text: message });
    }

    clearMessage() {
        this.subject.next();
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    /**
     * Checks in every set frequency the version of frontend application
     * @param url
     * @param {number} frequency - in milliseconds, defaults to 3 minutes
     */
    public async  initVersionCheck(url, frequency = 1000 * 60 * 1): Promise<boolean> {
        const res = await this.checkVersion(url);
        return res;
    }

    /**
     * Will do the call and check if the hash has changed or not
     * @param url
     */
    async checkVersion(url): Promise<boolean> {
        const response = await this.http.get("assets/version.json").toPromise();

        if (!response) {
            return false;
        }

        const data = response.json() as VersionModel;
        const hash = data.hash;
        const hashChanged = this.hasHashChanged(this.currentHash, hash);

        // If new version, do something
        if (hashChanged) {
            // ENTER YOUR CODE TO DO SOMETHING UPON VERSION CHANGE
        }
        // store the new hash so we wouldn't trigger versionChange again
        // only necessary in case you did not force refresh
        this.currentHash = hash;
        return hashChanged;
    }

    /**
     * Checks if hash has changed.
     * This file has the JS hash, if it is a different one than in the version.json
     * we are dealing with version change
     * @param currentHash
     * @param newHash
     * @returns {boolean}
     */
    hasHashChanged(currentHash, newHash) {
        if (!currentHash) {
            return false;
        }

        return currentHash !== newHash;
    }
}