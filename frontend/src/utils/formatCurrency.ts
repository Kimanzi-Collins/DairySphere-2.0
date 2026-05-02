export const formatCurrency = (amount: number): string => {
    return `Ksh. ${amount.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-KE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

export const formatLitres = (litres: number): string => {
    return `${litres.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} L`;
};