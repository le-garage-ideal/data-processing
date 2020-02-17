
export function csvEscape(string) {
    if (string) {
        return string.replace(/"/g, '""');
    } else {
        return '';
    }
}
