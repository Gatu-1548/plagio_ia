export function uploadDocumento(
  proyecto_id: string | number,
  file: File,
  onProgress?: (percent: number) => void
): Promise<any> {
  const url = "https://gateway-microservice-d5ccehh0ajaqgcd0.canadacentral-01.azurewebsites.net/upload-documento";

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("proyecto_id", String(proyecto_id));
    form.append("documento", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resp = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          resolve(resp);
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const percent = Math.round((ev.loaded / ev.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.send(form);
  });
}
