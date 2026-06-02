export function ToImageDto(image) {
    return image ? { id: image.id, imageUrl: image.imageUrl } : null;
}
