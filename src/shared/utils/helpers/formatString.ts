export const formatString = (input?: string | null): string => {
    if (!input) return '';
    const spacedFromCamel = input.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    const cleaned = spacedFromCamel.replace(/_/g, ' ').toLowerCase().trim();
    if (!cleaned) return '';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};