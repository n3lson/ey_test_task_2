import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Paths} from '../enum/paths.enum';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) { }

  public postFile(filename: string) {
    return this.http.post(Paths.FILES, filename); //return file_id
  }

  public postClass(cls: any) {
    return this.http.post(Paths.CLASSES, cls); //return class_id
  }

  public postAccount(account: any) {
    return this.http.post(Paths.ACCOUNTS, account); //return account_id
  }

  public postOpeningBalance(balance: any) {
    return this.http.post(Paths.OPENING_BALANCE, balance);
  }

  public postRevs(revs: any) {
    return this.http.post(Paths.REVS, revs);
  }

  public postClosingBalance(balance: any) {
    return this.http.post(Paths.CLOSING_BALANCE, balance);
  }

  public getFiles() {
    return this.http.get(Paths.GET_FILES);
  }

  public getDataFromFile(filename) {
    return this.http.get(Paths.GET_DATA_FROM + filename);
  }
}
