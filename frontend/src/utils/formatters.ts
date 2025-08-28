
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};