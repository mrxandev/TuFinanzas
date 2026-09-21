/* Utilidades de formato para localización en República Dominicana (es-DO) */

/* Formatea montos numéricos en Pesos Dominicanos (RD$ 1,250.50) */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `RD$ ${num.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/* Formatea fechas en formato Dominicano estricto (DD/MM/YYYY) */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const parts = dateString.split("T")[0].split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
