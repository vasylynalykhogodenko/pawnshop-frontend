export interface Client {
    _id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    passportNumber: string;
    passportSeries: string;
    passportIssueDate: Date;
}