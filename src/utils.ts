export async function getDataUrl(file: Blob): string{
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result)
        }
    })

}
