import { Certificate } from '../types/types';
import { extractParamFromSubject, toRussianDate } from '../utils/utils';

export const plugin = window.cadesplugin as any;

export class CadesPlugin {
    public static async getCertificatesFromStore() {
        const store = await plugin.CreateObjectAsync('CAdESCOM.Store');
        await store.Open(plugin.CAPICOM_CURRENT_USER_STORE, plugin.CAPICOM_MY_STORE, plugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

        const storeCertificates = await store.Certificates;
        const countCertificates = await storeCertificates.Count;
        const certificates: object[] = [];

        for (let i = 1; i <= countCertificates; i++) {
            const certificate = await storeCertificates.Item(i);
            certificates.push(certificate);
        }

        await store.Close();

        return certificates;
    }

    public static async parseCertificate(certificates: any[]): Promise<Certificate[]> {
        return await Promise.all(
            certificates.map(async (cert, index) => ({
                index,
                certObject: await cert,
                thumbprint: await cert.Thumbprint,
                subjectName: await cert.SubjectName,
                issuerName: await cert.IssuerName,
                validFrom: toRussianDate(await cert.ValidFromDate, 'date'),
                validTo: toRussianDate(await cert.ValidToDate, 'date'),
                inn: extractParamFromSubject(await cert.SubjectName, 'ИНН'),
                commonName: extractParamFromSubject(await cert.SubjectName, 'CN'),
            })),
        );
    }

    public static async getCertificateByThumbprint(thumbprint: string) {
        const certificates = await this.getCertificatesFromStore();

        const thumbprints = await Promise.all(certificates.map((cert: any) => cert.Thumbprint));
        const index = thumbprints.findIndex((tb) => tb === thumbprint);

        return certificates[index];
    }

    public static async verifySignature(data: any, signData: any, detached: boolean) {
        try {
            const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
            await signedData.propset_ContentEncoding(plugin.CADESCOM_BASE64_TO_BINARY);
            await signedData.propset_Content(data);
            await signedData.VerifyCades(signData, plugin.CADESCOM_CADES_BES, detached);

            return true;
        } catch (error) {
            return false;
        }
    }

    public static async signData(thumbprint: string, data: any, detached: boolean) {
        const base64Data = btoa(data);

        const certificate = await this.getCertificateByThumbprint(thumbprint);

        const signer = await plugin.CreateObjectAsync('CAdESCOM.CPSigner');
        await signer.propset_Certificate(certificate);
        await signer.propset_CheckCertificate(true);

        const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
        await signedData.propset_ContentEncoding(plugin.CADESCOM_BASE64_TO_BINARY);
        await signedData.propset_Content(base64Data);

        const signature = await signedData.SignCades(signer, plugin.CADESCOM_CADES_BES, detached);

        if (detached) {
            return signature.toString().replace(/\r\n/g, '').replace(/\r/g, '').replace(/\n/g, '');
        }

        return signature;
    }
}
