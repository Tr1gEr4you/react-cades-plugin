export function toRussianDate(isoString: string, options: 'date' | 'time' | 'full' = 'date') {
    const date = new Date(isoString);

    const formats: Record<'date' | 'time' | 'full', Intl.DateTimeFormatOptions> = {
        date: {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        },
        time: {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        },
        full: {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        },
    };

    return date.toLocaleDateString('ru-Ru', formats[options]);
}

export function extractParamFromSubject(input: string, paramName: string) {
    const regex = new RegExp(`${paramName}=([^,]+)`);
    const match = input.match(regex);
    return match ? match[1].trim() : '';
}
