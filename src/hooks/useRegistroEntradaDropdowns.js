import { useState, useEffect } from 'react';
import posicaoService from '../services/posicaoService';
import marcaService from '../services/marcaService';
import seguradoraService from '../services/seguradoraService';
import colaboradorService from '../services/colaboradorService';

const useRegistroEntradaDropdowns = () => {
  // Estados para armazenar os dados
  const [posicoes, setPosicoes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [seguradoras, setSeguradoras] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  
  // Estados de loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar todos os dados
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo para melhor performance
      const [posicoesResponse, marcasResponse, seguradorasResponse, colaboradoresResponse] = await Promise.all([
        posicaoService.getAll(1, 1000), // Buscar até 1000 registros
        marcaService.getAll(1, 1000),
        seguradoraService.getAll(1, 1000),
        colaboradorService.getAll(1, 1000)
      ]);

      // Verificar se todas as respostas foram bem-sucedidas
      if (posicoesResponse.success) {
        setPosicoes(posicoesResponse.data);
      }
      
      if (marcasResponse.success) {
        setMarcas(marcasResponse.data);
      }
      
      if (seguradorasResponse.success) {
        setSeguradoras(seguradorasResponse.data);
      }
      
      if (colaboradoresResponse.success) {
        setColaboradores(colaboradoresResponse.data);
      }

    } catch (err) {
      console.error('Erro ao carregar dados dos dropdowns:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o hook for inicializado
  useEffect(() => {
    loadAllData();
  }, []);

  // Função para recarregar dados (útil quando novos itens são adicionados)
  const reloadData = () => {
    loadAllData();
  };

  // Retornar os dados e funções úteis
  return {
    // Dados
    posicoes,
    marcas,
    seguradoras,
    colaboradores,
    
    // Estados
    loading,
    error,
    
    // Funções
    reloadData
  };
};

export default useRegistroEntradaDropdowns;

