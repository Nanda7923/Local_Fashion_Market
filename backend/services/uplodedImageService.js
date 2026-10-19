async function uploadedImages(files, protocol, host,folder) {
    if (!files || files.length === 0) {
        throw new Error("No images uploaded");
    }

    return files.map((file) => {
        return `${protocol}://${host}/uploads/${folder}/${file.filename}`;
    });
}

module.exports = {
    uploadedImages
}