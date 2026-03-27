export const formatPrice = (price) => {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `http://localhost:8000${imagePath}`;
};
