/**
 * Tiện ích in ấn và xuất PDF thông qua Hidden Iframe
 * Tái sử dụng chung cho: In hóa đơn (UC-17), In đơn thuốc (UC-14), In hồ sơ y tế
 * - Không bị chặn bởi Popup Blocker
 * - Độc lập với CSS / Dark mode của trang hiện tại
 * - Kích hoạt hộp thoại in / lưu PDF trực tiếp của trình duyệt
 */
export function printHtmlViaHiddenIframe(htmlContent: string, frameId = 'medicare-print-frame'): void {
  let iframe = document.getElementById(frameId) as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = frameId;
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Chờ font và style render xong trước khi gọi in
  setTimeout(() => {
    iframe?.contentWindow?.focus();
    iframe?.contentWindow?.print();
  }, 350);
}
