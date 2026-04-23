export interface Certificate {
    index: number;
    certObject: any;
    thumbprint: string;
    subjectName: string;
    issuerName: string;
    validFrom: string;
    validTo: string;
    inn: string;
    commonName: string;
}
