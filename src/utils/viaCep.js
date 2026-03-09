import 'dotenv/config'

const buscarEnderecoNoViaCep = async (cep) => {
  if (!cep || cep.length < 8) return null;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    return data.erro ? null : data;
  } catch (error) {
    throw new Error("VIA_CEP_OFFLINE");
  }
};

export default buscarEnderecoNoViaCep