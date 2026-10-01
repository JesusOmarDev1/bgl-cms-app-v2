declare module "qrcode" {
  export interface QRCode {
    modules: {
      size: number
      data: Uint8Array
    }
  }

  interface QRCodeStatic {
    create(
      text: string,
      options?: { errorCorrectionLevel?: "L" | "M" | "Q" | "H" }
    ): QRCode
  }

  const QRCode: QRCodeStatic
  export default QRCode
}
