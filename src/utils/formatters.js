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

/* Formatea una cédula dominicana (000-0000000-0) admitiendo solo dígitos numéricos (máx. 11 dígitos) */
export const formatCedula = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10, 11)}`;
};

/**
 * Valida si una cédula dominicana es válida mediante el algoritmo de Luhn (módulo 10 con pesos alternados 1, 2).
 * @param {string} pCedula - Cédula con o sin guiones.
 * @returns {boolean} - true si la cédula es válida, false en caso contrario.
 */
export const validarCedula = (pCedula) => {
  if (!pCedula || typeof pCedula !== "string") return false;

  const vcCedula = pCedula.replace(/-/g, "").trim();
  const pLongCed = vcCedula.length;
  const digitoMult = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];

  if (pLongCed !== 11 || !/^\d{11}$/.test(vcCedula)) {
    return false;
  }

  // Descartar cédulas inválidas con todos ceros
  if (vcCedula === "00000000000") return false;

  let vnTotal = 0;
  for (let vDig = 1; vDig <= pLongCed; vDig++) {
    const vCalculo = parseInt(vcCedula.substring(vDig - 1, vDig), 10) * digitoMult[vDig - 1];
    if (vCalculo < 10) {
      vnTotal += vCalculo;
    } else {
      const vStr = vCalculo.toString();
      vnTotal += parseInt(vStr.substring(0, 1), 10) + parseInt(vStr.substring(1, 2), 10);
    }
  }

  return vnTotal % 10 === 0;
};

