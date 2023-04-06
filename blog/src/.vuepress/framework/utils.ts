export const getHours = () => {
    const date = new Date();
    const hour = date.getHours() + date.getTimezoneOffset() / 60 + 8;
    return hour;
}