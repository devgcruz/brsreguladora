import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Skeleton,
} from '@mui/material';
import BlurredDialog from './BlurredDialog';
import OptimizedSelect from './OptimizedSelect';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import PdfModal from './PdfModal';
import prestadorService from '../services/prestadorService';
import entradaService from '../services/entradaService';
import useOptimizedDropdowns from '../hooks/useOptimizedDropdowns';

// Dados de exemplo para preenchimento automático
const dadosExemploADM = [
  {
    entrada: '2024-01-15',
    marca: 'Toyota',
    veiculo: 'Corolla',
    placa: 'ABC-1234',
    chassi: '1HGBH41JXMN109186',
    anoVeiculo: '2020',
    anoModelo: '2021',
    seguradora: 'Porto Seguro',
    codSinistro: 'PS2024001',
    numeroBO: '123456789',
    ufSinistro: 'SP',
    cidadeSinistro: 'São Paulo',
    posicao: 'DOCTOS RECEBIDO',
    uf: 'SP',
    cidade: 'São Paulo',
    numeroProcesso: 'ADM001/2024',
    tipo: 'ADM',
    situacao: 'ATIVO',
    cor: 'Branco',
    renavam: '12345678901',
    numeroMotor: '2ZR1234567',
    observacoes: 'Veículo em perfeito estado, sinistro simples'
  },
  {
    entrada: '2024-01-20',
    marca: 'Honda',
    veiculo: 'Civic',
    placa: 'DEF-5678',
    chassi: '1HGBH41JXMN109187',
    anoVeiculo: '2019',
    anoModelo: '2020',
    seguradora: 'SulAmérica',
    codSinistro: 'SA2024002',
    numeroBO: '987654321',
    ufSinistro: 'RJ',
    cidadeSinistro: 'Rio de Janeiro',
    posicao: 'AGUARDA DOCUMENTOS',
    uf: 'RJ',
    cidade: 'Rio de Janeiro',
    numeroProcesso: 'ADM002/2024',
    tipo: 'ADM',
    situacao: 'PENDENTE',
    cor: 'Prata',
    renavam: '98765432109',
    numeroMotor: 'R18A1234567',
    observacoes: 'Aguardando documentação do segurado'
  },
  {
    entrada: '2024-02-01',
    marca: 'Ford',
    veiculo: 'Focus',
    placa: 'GHI-9012',
    chassi: '1HGBH41JXMN109188',
    anoVeiculo: '2018',
    anoModelo: '2019',
    seguradora: 'Bradesco Seguros',
    codSinistro: 'BS2024003',
    numeroBO: '456789123',
    ufSinistro: 'MG',
    cidadeSinistro: 'Belo Horizonte',
    posicao: 'DOCTOS ENVIADO REP',
    uf: 'MG',
    cidade: 'Belo Horizonte',
    numeroProcesso: 'ADM003/2024',
    tipo: 'ADM',
    situacao: 'EM_ANALISE',
    cor: 'Azul',
    renavam: '45678912345',
    numeroMotor: '1.6L1234567',
    observacoes: 'Documentos enviados para representante'
  },
  {
    entrada: '2024-02-10',
    marca: 'Chevrolet',
    veiculo: 'Onix',
    placa: 'JKL-3456',
    chassi: '1HGBH41JXMN109189',
    anoVeiculo: '2021',
    anoModelo: '2022',
    seguradora: 'Itaú Seguros',
    codSinistro: 'IS2024004',
    numeroBO: '789123456',
    ufSinistro: 'RS',
    cidadeSinistro: 'Porto Alegre',
    posicao: 'VEÍCULO LIBERADO',
    uf: 'RS',
    cidade: 'Porto Alegre',
    numeroProcesso: 'ADM004/2024',
    tipo: 'ADM',
    situacao: 'LIBERADO',
    cor: 'Vermelho',
    renavam: '78912345678',
    numeroMotor: '1.0L1234567',
    observacoes: 'Veículo liberado para retirada'
  },
  {
    entrada: '2024-02-15',
    marca: 'Volkswagen',
    veiculo: 'Golf',
    placa: 'MNO-7890',
    chassi: '1HGBH41JXMN109190',
    anoVeiculo: '2020',
    anoModelo: '2021',
    seguradora: 'Allianz',
    codSinistro: 'AL2024005',
    numeroBO: '321654987',
    ufSinistro: 'PR',
    cidadeSinistro: 'Curitiba',
    posicao: 'VEÍCULO REMOVIDO',
    uf: 'PR',
    cidade: 'Curitiba',
    numeroProcesso: 'ADM005/2024',
    tipo: 'ADM',
    situacao: 'REMOVIDO',
    cor: 'Preto',
    renavam: '32165498765',
    numeroMotor: '1.4L1234567',
    observacoes: 'Veículo removido do pátio'
  },
  {
    entrada: '2024-03-01',
    marca: 'Fiat',
    veiculo: 'Argo',
    placa: 'PQR-2468',
    chassi: '1HGBH41JXMN109191',
    anoVeiculo: '2022',
    anoModelo: '2023',
    seguradora: 'Zurich',
    codSinistro: 'ZU2024006',
    numeroBO: '654987321',
    ufSinistro: 'BA',
    cidadeSinistro: 'Salvador',
    posicao: 'DOCTOS RECEBIDO REP',
    uf: 'BA',
    cidade: 'Salvador',
    numeroProcesso: 'ADM006/2024',
    tipo: 'ADM',
    situacao: 'DOCUMENTADO',
    cor: 'Cinza',
    renavam: '65498732109',
    numeroMotor: '1.3L1234567',
    observacoes: 'Documentos recebidos do representante'
  },
  {
    entrada: '2024-03-10',
    marca: 'Hyundai',
    veiculo: 'HB20',
    placa: 'STU-1357',
    chassi: '1HGBH41JXMN109192',
    anoVeiculo: '2021',
    anoModelo: '2022',
    seguradora: 'HDI Seguros',
    codSinistro: 'HD2024007',
    numeroBO: '147258369',
    ufSinistro: 'CE',
    cidadeSinistro: 'Fortaleza',
    posicao: 'FINALIZADO',
    uf: 'CE',
    cidade: 'Fortaleza',
    numeroProcesso: 'ADM007/2024',
    tipo: 'ADM',
    situacao: 'FINALIZADO',
    cor: 'Branco',
    renavam: '14725836985',
    numeroMotor: '1.0L1234567',
    observacoes: 'Processo finalizado com sucesso'
  },
  {
    entrada: '2024-03-20',
    marca: 'Nissan',
    veiculo: 'Versa',
    placa: 'VWX-9753',
    chassi: '1HGBH41JXMN109193',
    anoVeiculo: '2019',
    anoModelo: '2020',
    seguradora: 'Liberty Seguros',
    codSinistro: 'LI2024008',
    numeroBO: '258147369',
    ufSinistro: 'PE',
    cidadeSinistro: 'Recife',
    posicao: 'CANCELADO',
    uf: 'PE',
    cidade: 'Recife',
    numeroProcesso: 'ADM008/2024',
    tipo: 'ADM',
    situacao: 'CANCELADO',
    cor: 'Prata',
    renavam: '25814736974',
    numeroMotor: '1.6L1234567',
    observacoes: 'Processo cancelado por falta de documentação'
  },
  {
    entrada: '2024-04-01',
    marca: 'BMW',
    veiculo: '320i',
    placa: 'YZA-8642',
    chassi: '1HGBH41JXMN109194',
    anoVeiculo: '2020',
    anoModelo: '2021',
    seguradora: 'Porto Seguro',
    codSinistro: 'PS2024009',
    numeroBO: '369258147',
    ufSinistro: 'DF',
    cidadeSinistro: 'Brasília',
    posicao: 'DOCTOS RECEBIDO',
    uf: 'DF',
    cidade: 'Brasília',
    numeroProcesso: 'ADM009/2024',
    tipo: 'ADM',
    situacao: 'ATIVO',
    cor: 'Azul',
    renavam: '36925814763',
    numeroMotor: '2.0L1234567',
    observacoes: 'Veículo de luxo, processo prioritário'
  },
  {
    entrada: '2024-04-15',
    marca: 'Mercedes-Benz',
    veiculo: 'C180',
    placa: 'BCD-1597',
    chassi: '1HGBH41JXMN109195',
    anoVeiculo: '2021',
    anoModelo: '2022',
    seguradora: 'SulAmérica',
    codSinistro: 'SA2024010',
    numeroBO: '741852963',
    ufSinistro: 'SC',
    cidadeSinistro: 'Florianópolis',
    posicao: 'AGUARDA DOCUMENTOS',
    uf: 'SC',
    cidade: 'Florianópolis',
    numeroProcesso: 'ADM010/2024',
    tipo: 'ADM',
    situacao: 'PENDENTE',
    cor: 'Preto',
    renavam: '74185296352',
    numeroMotor: '1.6L1234567',
    observacoes: 'Aguardando documentação adicional'
  }
];

const dadosExemploJudicial = [
  {
    entrada: '2024-01-10',
    marca: 'Toyota',
    veiculo: 'Hilux',
    placa: 'JUD-0001',
    chassi: '1HGBH41JXMN109196',
    anoVeiculo: '2019',
    anoModelo: '2020',
    seguradora: 'Porto Seguro',
    codSinistro: 'PSJUD001',
    numeroBO: '111222333',
    ufSinistro: 'SP',
    cidadeSinistro: 'São Paulo',
    posicao: 'DOCTOS RECEBIDO',
    uf: 'SP',
    cidade: 'São Paulo',
    numeroProcesso: 'JUD001/2024',
    tipo: 'JUDICIAL',
    situacao: 'EM_ANALISE',
    cor: 'Branco',
    renavam: '11122233344',
    numeroMotor: '2.8L1234567',
    comarca: 'São Paulo',
    numeroProcessoJudicial: '1234567-89.2024.8.26.0001',
    notaFiscal: 'NF001/2024',
    numeroVara: '1ª Vara Cível',
    dataPagamento: '2024-01-25',
    honorario: 'R$ 5.000,00',
    nomeBanco: 'Banco do Brasil',
    observacoes: 'Processo judicial em andamento, aguardando decisão'
  },
  {
    entrada: '2024-01-25',
    marca: 'Honda',
    veiculo: 'CR-V',
    placa: 'JUD-0002',
    chassi: '1HGBH41JXMN109197',
    anoVeiculo: '2020',
    anoModelo: '2021',
    seguradora: 'SulAmérica',
    codSinistro: 'SAJUD002',
    numeroBO: '444555666',
    ufSinistro: 'RJ',
    cidadeSinistro: 'Rio de Janeiro',
    posicao: 'AGUARDA DOCUMENTOS',
    uf: 'RJ',
    cidade: 'Rio de Janeiro',
    numeroProcesso: 'JUD002/2024',
    tipo: 'JUDICIAL',
    situacao: 'PENDENTE',
    cor: 'Prata',
    renavam: '44455566677',
    numeroMotor: '1.5L1234567',
    comarca: 'Rio de Janeiro',
    numeroProcessoJudicial: '2345678-90.2024.8.19.0001',
    notaFiscal: 'NF002/2024',
    numeroVara: '2ª Vara Cível',
    dataPagamento: '2024-02-10',
    honorario: 'R$ 7.500,00',
    nomeBanco: 'Caixa Econômica Federal',
    observacoes: 'Processo com complexidade jurídica elevada'
  },
  {
    entrada: '2024-02-05',
    marca: 'Ford',
    veiculo: 'Ranger',
    placa: 'JUD-0003',
    chassi: '1HGBH41JXMN109198',
    anoVeiculo: '2018',
    anoModelo: '2019',
    seguradora: 'Bradesco Seguros',
    codSinistro: 'BSJUD003',
    numeroBO: '777888999',
    ufSinistro: 'MG',
    cidadeSinistro: 'Belo Horizonte',
    posicao: 'DOCTOS ENVIADO REP',
    uf: 'MG',
    cidade: 'Belo Horizonte',
    numeroProcesso: 'JUD003/2024',
    tipo: 'JUDICIAL',
    situacao: 'DOCUMENTADO',
    cor: 'Azul',
    renavam: '77788899988',
    numeroMotor: '3.2L1234567',
    comarca: 'Belo Horizonte',
    numeroProcessoJudicial: '3456789-01.2024.8.13.0001',
    notaFiscal: 'NF003/2024',
    numeroVara: '3ª Vara Cível',
    dataPagamento: '2024-02-20',
    honorario: 'R$ 10.000,00',
    nomeBanco: 'Banco Santander',
    observacoes: 'Documentos enviados para análise judicial'
  },
  {
    entrada: '2024-02-20',
    marca: 'Chevrolet',
    veiculo: 'S10',
    placa: 'JUD-0004',
    chassi: '1HGBH41JXMN109199',
    anoVeiculo: '2021',
    anoModelo: '2022',
    seguradora: 'Itaú Seguros',
    codSinistro: 'ISJUD004',
    numeroBO: '000111222',
    ufSinistro: 'RS',
    cidadeSinistro: 'Porto Alegre',
    posicao: 'VEÍCULO LIBERADO',
    uf: 'RS',
    cidade: 'Porto Alegre',
    numeroProcesso: 'JUD004/2024',
    tipo: 'JUDICIAL',
    situacao: 'LIBERADO',
    cor: 'Vermelho',
    renavam: '00011122233',
    numeroMotor: '2.8L1234567',
    comarca: 'Porto Alegre',
    numeroProcessoJudicial: '4567890-12.2024.8.26.0001',
    notaFiscal: 'NF004/2024',
    numeroVara: '4ª Vara Cível',
    dataPagamento: '2024-03-05',
    honorario: 'R$ 12.500,00',
    nomeBanco: 'Banco Itaú',
    observacoes: 'Veículo liberado após decisão judicial'
  },
  {
    entrada: '2024-03-01',
    marca: 'Volkswagen',
    veiculo: 'Amarok',
    placa: 'JUD-0005',
    chassi: '1HGBH41JXMN109200',
    anoVeiculo: '2020',
    anoModelo: '2021',
    seguradora: 'Allianz',
    codSinistro: 'ALJUD005',
    numeroBO: '333444555',
    ufSinistro: 'PR',
    cidadeSinistro: 'Curitiba',
    posicao: 'VEÍCULO REMOVIDO',
    uf: 'PR',
    cidade: 'Curitiba',
    numeroProcesso: 'JUD005/2024',
    tipo: 'JUDICIAL',
    situacao: 'REMOVIDO',
    cor: 'Preto',
    renavam: '33344455566',
    numeroMotor: '3.0L1234567',
    comarca: 'Curitiba',
    numeroProcessoJudicial: '5678901-23.2024.8.41.0001',
    notaFiscal: 'NF005/2024',
    numeroVara: '5ª Vara Cível',
    dataPagamento: '2024-03-15',
    honorario: 'R$ 15.000,00',
    nomeBanco: 'Banco Bradesco',
    observacoes: 'Veículo removido após cumprimento de sentença'
  },
  {
    entrada: '2024-03-15',
    marca: 'Fiat',
    veiculo: 'Toro',
    placa: 'JUD-0006',
    chassi: '1HGBH41JXMN109201',
    anoVeiculo: '2022',
    anoModelo: '2023',
    seguradora: 'Zurich',
    codSinistro: 'ZUJUD006',
    numeroBO: '666777888',
    ufSinistro: 'BA',
    cidadeSinistro: 'Salvador',
    posicao: 'DOCTOS RECEBIDO REP',
    uf: 'BA',
    cidade: 'Salvador',
    numeroProcesso: 'JUD006/2024',
    tipo: 'JUDICIAL',
    situacao: 'EM_ANALISE',
    cor: 'Cinza',
    renavam: '66677788899',
    numeroMotor: '2.0L1234567',
    comarca: 'Salvador',
    numeroProcessoJudicial: '6789012-34.2024.8.29.0001',
    notaFiscal: 'NF006/2024',
    numeroVara: '6ª Vara Cível',
    dataPagamento: '2024-03-30',
    honorario: 'R$ 8.500,00',
    nomeBanco: 'Banco do Nordeste',
    observacoes: 'Documentos recebidos do representante legal'
  },
  {
    entrada: '2024-04-01',
    marca: 'Hyundai',
    veiculo: 'Tucson',
    placa: 'JUD-0007',
    chassi: '1HGBH41JXMN109202',
    anoVeiculo: '2021',
    anoModelo: '2022',
    seguradora: 'HDI Seguros',
    codSinistro: 'HDJUD007',
    numeroBO: '999000111',
    ufSinistro: 'CE',
    cidadeSinistro: 'Fortaleza',
    posicao: 'FINALIZADO',
    uf: 'CE',
    cidade: 'Fortaleza',
    numeroProcesso: 'JUD007/2024',
    tipo: 'JUDICIAL',
    situacao: 'FINALIZADO',
    cor: 'Branco',
    renavam: '99900011122',
    numeroMotor: '2.0L1234567',
    comarca: 'Fortaleza',
    numeroProcessoJudicial: '7890123-45.2024.8.23.0001',
    notaFiscal: 'NF007/2024',
    numeroVara: '7ª Vara Cível',
    dataPagamento: '2024-04-15',
    honorario: 'R$ 20.000,00',
    nomeBanco: 'Banco do Brasil',
    observacoes: 'Processo judicial finalizado com sucesso'
  },
  {
    entrada: '2024-04-10',
    marca: 'Nissan',
    veiculo: 'Frontier',
    placa: 'JUD-0008',
    chassi: '1HGBH41JXMN109203',
    anoVeiculo: '2019',
    anoModelo: '2020',
    seguradora: 'Liberty Seguros',
    codSinistro: 'LIJUD008',
    numeroBO: '222333444',
    ufSinistro: 'PE',
    cidadeSinistro: 'Recife',
    posicao: 'CANCELADO',
    uf: 'PE',
    cidade: 'Recife',
    numeroProcesso: 'JUD008/2024',
    tipo: 'JUDICIAL',
    situacao: 'CANCELADO',
    cor: 'Prata',
    renavam: '22233344455',
    numeroMotor: '2.5L1234567',
    comarca: 'Recife',
    numeroProcessoJudicial: '8901234-56.2024.8.17.0001',
    notaFiscal: 'NF008/2024',
    numeroVara: '8ª Vara Cível',
    dataPagamento: '2024-04-25',
    honorario: 'R$ 6.000,00',
    nomeBanco: 'Banco Santander',
    observacoes: 'Processo cancelado por falta de provas'
  },
  {
    entrada: '2024-04-20',
    marca: 'BMW',
    veiculo: 'X3',
    placa: 'JUD-0009',
    chassi: '1HGBH41JXMN109204',
    anoVeiculo: '2020',
    anoModelo: '2021',
    seguradora: 'Porto Seguro',
    codSinistro: 'PSJUD009',
    numeroBO: '555666777',
    ufSinistro: 'DF',
    cidadeSinistro: 'Brasília',
    posicao: 'DOCTOS RECEBIDO',
    uf: 'DF',
    cidade: 'Brasília',
    numeroProcesso: 'JUD009/2024',
    tipo: 'JUDICIAL',
    situacao: 'ATIVO',
    cor: 'Azul',
    renavam: '55566677788',
    numeroMotor: '2.0L1234567',
    comarca: 'Brasília',
    numeroProcessoJudicial: '9012345-67.2024.8.07.0001',
    notaFiscal: 'NF009/2024',
    numeroVara: '9ª Vara Cível',
    dataPagamento: '2024-05-05',
    honorario: 'R$ 25.000,00',
    nomeBanco: 'Banco do Brasil',
    observacoes: 'Processo de alta complexidade jurídica'
  },
  {
    entrada: '2024-05-01',
    marca: 'Mercedes-Benz',
    veiculo: 'GLA',
    placa: 'JUD-0010',
    chassi: '1HGBH41JXMN109205',
    anoVeiculo: '2021',
    anoModelo: '2022',
    seguradora: 'SulAmérica',
    codSinistro: 'SAJUD010',
    numeroBO: '888999000',
    ufSinistro: 'SC',
    cidadeSinistro: 'Florianópolis',
    posicao: 'AGUARDA DOCUMENTOS',
    uf: 'SC',
    cidade: 'Florianópolis',
    numeroProcesso: 'JUD010/2024',
    tipo: 'JUDICIAL',
    situacao: 'PENDENTE',
    cor: 'Preto',
    renavam: '88899900011',
    numeroMotor: '1.6L1234567',
    comarca: 'Florianópolis',
    numeroProcessoJudicial: '0123456-78.2024.8.24.0001',
    notaFiscal: 'NF010/2024',
    numeroVara: '10ª Vara Cível',
    dataPagamento: '2024-05-15',
    honorario: 'R$ 18.000,00',
    nomeBanco: 'Caixa Econômica Federal',
    observacoes: 'Aguardando documentação judicial complementar'
  }
];

const NovoRegistroModal = ({ open, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [savedEntradaId, setSavedEntradaId] = useState(null);
  const [validatingPlaca, setValidatingPlaca] = useState(false);
  const [placaSnackbar, setPlacaSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const [isReady, setIsReady] = useState(false);
  
  // Hook otimizado para dropdowns
  const {
    ufOptions,
    cidadeSinistroOptions,
    cidadeLocalizacaoOptions,
    colaboradorOptions,
    loadingUfs,
    loadingCidadesSinistro,
    loadingCidadesLocalizacao,
    loadingColaboradores,
    initialized,
    loadUfs,
    loadColaboradores,
    loadCidadesSinistro,
    loadCidadesLocalizacao,
    initializeData,
    clearCache
  } = useOptimizedDropdowns();
  

  const [formData, setFormData] = useState({
    protocolo: '',
    entrada: '',
    marca: '',
    veiculo: '',
    placa: '',
    chassi: '',
    anoVeiculo: '',
    anoModelo: '',
    seguradora: '',
    codSinistro: '',
    numeroBO: '',
    ufSinistro: '',
    cidadeSinistro: '',
    colaborador: '',
    posicao: '',
    uf: '',
    cidade: '',
    numeroProcesso: '',
    tipo: '',
    situacao: '',
    // Novos campos
    cor: '',
    renavam: '',
    numeroMotor: '',
    // Campos condicionais para tipo Judicial
    comarca: '',
    numeroProcessoJudicial: '',
    notaFiscal: '',
    numeroVara: '',
    dataPagamento: '',
    honorario: '',
    nomeBanco: '',
    observacoes: ''
  });

  // Estado para observações em formato de posts
  const [observacoes, setObservacoes] = useState([]);
  const [novaObservacao, setNovaObservacao] = useState('');

  // Opções para campos de seleção - memoizadas para performance
  const marcas = useMemo(() => ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Hyundai', 'Nissan', 'BMW', 'Mercedes-Benz'], []);
  const seguradoras = useMemo(() => ['Porto Seguro', 'SulAmérica', 'Bradesco Seguros', 'Itaú Seguros', 'Allianz', 'Zurich', 'HDI Seguros', 'Liberty Seguros'], []);
  const posicoes = useMemo(() => [
    'DOCTOS RECEBIDO',
    'AGUARDA DOCUMENTOS',
    'DOCTOS ENVIADO REP',
    'VEÍCULO LIBERADO',
    'VEÍCULO REMOVIDO',
    'DOCTOS RECEBIDO REP',
    'FINALIZADO',
    'CANCELADO'
  ], []);

  // Handlers otimizados para mudança de UF
  const handleUfSinistroChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      ufSinistro: value,
      cidadeSinistro: ''
    }));
    
    if (value) {
      const ufSelecionada = ufOptions.find(uf => uf.value === value);
      if (ufSelecionada) {
        loadCidadesSinistro(ufSelecionada.value);
      }
    }
  }, [ufOptions, loadCidadesSinistro]);

  const handleUfLocalizacaoChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      uf: value,
      cidade: ''
    }));
    
    if (value) {
      const ufSelecionada = ufOptions.find(uf => uf.value === value);
      if (ufSelecionada) {
        loadCidadesLocalizacao(ufSelecionada.value);
      }
    }
  }, [ufOptions, loadCidadesLocalizacao]);

  // Carregar dados iniciais quando o modal abrir - PADRÃO DE CARREGAMENTO ESTRITAMENTE CONTROLADO
  useEffect(() => {
    if (open) {
      setIsReady(false); // Reseta o estado de prontidão ao abrir

      const initializeForm = async () => {
        try {
          // 1. Carrega TODAS as opções de dropdown primeiro
          await initializeData();

          // 2. Libera a renderização do formulário
          setIsReady(true);

        } catch (err) {
          setError('Falha ao inicializar o formulário. Tente novamente.');
          console.error("Initialization Error:", err);
        }
      };

      initializeForm();
    }
  }, [open, initializeData]);

  const tipos = useMemo(() => ['JUDICIAL', 'ADM'], []);

  const handleInputChange = useCallback((field) => (eventOrValue) => {
    const value = (eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue)
      ? eventOrValue.target.value
      : eventOrValue;

    // Usar handlers específicos para UFs
    if (field === 'ufSinistro') {
      handleUfSinistroChange(value);
    } else if (field === 'uf') {
      handleUfLocalizacaoChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, [handleUfSinistroChange, handleUfLocalizacaoChange]);

  // Função para validar placa em tempo real
  const validatePlaca = useCallback(async (placa) => {
    if (!placa || placa.trim() === '') {
      return;
    }

    setValidatingPlaca(true);

    try {
      const response = await entradaService.checkPlacaExists(placa.trim());
      
      if (response.exists) {
        setPlacaSnackbar({
          open: true,
          message: 'Esta placa já está cadastrada no sistema',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao validar placa:', error);
      setPlacaSnackbar({
        open: true,
        message: 'Erro ao verificar placa. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setValidatingPlaca(false);
    }
  }, []);

  // Handler para o campo de placa
  const handlePlacaChange = useCallback((event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      placa: value
    }));
    
    // Limpar erro quando o usuário começar a digitar
  }, []);

  // Handler para quando o usuário sair do campo de placa
  const handlePlacaBlur = useCallback((event) => {
    const placa = event.target.value.trim();
    if (placa) {
      validatePlaca(placa);
    }
  }, [validatePlaca]);

  // Handler para fechar o Snackbar da placa
  const handleClosePlacaSnackbar = useCallback(() => {
    setPlacaSnackbar(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Função para adicionar nova observação
  const adicionarObservacao = useCallback(() => {
    if (novaObservacao.trim()) {
      const novaObs = {
        id: String(Date.now()),
        texto: novaObservacao.trim(),
        autor: 'Usuário Atual', // Em produção, pegar do contexto de autenticação
        data: new Date().toLocaleString('pt-BR'),
        timestamp: new Date().toISOString()
      };
      
      setObservacoes(prev => {
        const novasObservacoes = [novaObs, ...prev];
        return novasObservacoes;
      });
      setNovaObservacao('');
    }
  }, [novaObservacao]);

  // Função para remover observação
  const removerObservacao = useCallback((id) => {
    setObservacoes(prev => prev.filter(obs => obs.id !== id));
  }, []);

  const handleOpenPdfModal = useCallback(() => {
    setPdfModalOpen(true);
  }, []);

  const handleClosePdfModal = useCallback(() => {
    setPdfModalOpen(false);
  }, []);

  // Função para preencher dados ADM aleatórios
  const preencherDadosADM = useCallback(() => {
    const dadosAleatorios = dadosExemploADM[Math.floor(Math.random() * dadosExemploADM.length)];
    setFormData(prev => ({
      ...prev,
      ...dadosAleatorios
    }));
    setSuccess('Dados ADM preenchidos automaticamente!');
  }, []);

  // Função para preencher dados Judicial aleatórios
  const preencherDadosJudicial = useCallback(() => {
    const dadosAleatorios = dadosExemploJudicial[Math.floor(Math.random() * dadosExemploJudicial.length)];
    setFormData(prev => ({
      ...prev,
      ...dadosAleatorios
    }));
    setSuccess('Dados Judicial preenchidos automaticamente!');
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validação detalhada
      const camposObrigatorios = [];
      
      // Verificar se os campos obrigatórios estão preenchidos
      // Protocolo não é mais obrigatório - será preenchido automaticamente
      
      if (!formData.entrada || formData.entrada.toString().trim() === '') {
        camposObrigatorios.push('Data de Entrada');
      }
      
      if (!formData.marca || formData.marca.toString().trim() === '') {
        camposObrigatorios.push('Marca');
      }
      
      if (!formData.veiculo || formData.veiculo.toString().trim() === '') {
        camposObrigatorios.push('Veículo');
      }
      
      if (camposObrigatorios.length > 0) {
        throw new Error(`Por favor, preencha os seguintes campos obrigatórios: ${camposObrigatorios.join(', ')}`);
      }

      // Verificação de placa removida - validação feita em tempo real

      // Preparar dados para a API
      const dadosParaAPI = {
        ID_COLABORADOR: formData.colaborador ? colaboradorOptions.find(c => c && c.label === formData.colaborador)?.id : null,
        DATA_ENTRADA: formData.entrada,
        MARCA: formData.marca,
        VEICULO: formData.veiculo,
        PLACA: formData.placa,
        CHASSI: formData.chassi,
        ANO_VEIC: formData.anoVeiculo,
        COD_SINISTRO: formData.codSinistro,
        NUM_BO: formData.numeroBO,
        UF_SINISTRO: formData.ufSinistro,
        CIDADE_SINISTRO: formData.cidadeSinistro,
        SEGURADORA: formData.seguradora,
        POSICAO: formData.posicao,
        SITUACAO: formData.situacao,
        UF: formData.uf,
        CIDADE: formData.cidade,
        MES: new Date(formData.entrada).toLocaleDateString('pt-BR', { month: 'long' }),
        TIPO: formData.tipo,
        ANO_MODELO: formData.anoModelo,
        COR_VEICULO: formData.corVeiculo,
        PROTOCOLO: formData.protocolo,
        NUMERO_PROCESSO: formData.numeroProcesso,
        // Novos campos
        COR: formData.cor,
        RENAVAM: formData.renavam,
        NUMERO_MOTOR: formData.numeroMotor,
        // Campos condicionais para tipo Judicial
        COMARCA: formData.comarca,
        NUMERO_PROCESSO_JUDICIAL: formData.numeroProcessoJudicial,
        NOTA_FISCAL: formData.notaFiscal,
        NUMERO_VARA: formData.numeroVara,
        DATA_PAGAMENTO: formData.dataPagamento,
        HONORARIO: formData.honorario,
        NOME_BANCO: formData.nomeBanco,
        OBSERVACOES: formData.observacoes,
        // Observações em formato de posts
        OBSERVACOES_POSTS: observacoes
      };

      // Salvar via API
      const response = await entradaService.createEntrada(dadosParaAPI);
      
      if (response.success) {
        setSuccess('Registro salvo com sucesso!');
        
        // Armazenar ID da entrada criada para permitir upload de PDFs
        const entradaId = response.data.Id_Entrada || response.data.id;
        setSavedEntradaId(entradaId);
        
        // Chamar callback de salvamento
        if (onSave) {
          onSave(response.data);
        }

        // Fechar modal após um breve delay
      setTimeout(() => {
        onClose();
        }, 1500);
      } else {
        // Tratar erro específico de placa duplicada
        if (response.errorType === 'placa_duplicada') {
          setPlacaSnackbar({
            open: true,
            message: response.message,
            severity: 'error'
          });
        } else {
          throw new Error(response.message || 'Erro ao salvar registro');
        }
      }
      
    } catch (err) {
      setError(err.message || 'Erro ao salvar registro');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, colaboradorOptions, observacoes, onClose]);

  const handleClose = useCallback(() => {
    // Resetar todos os campos para strings vazias para evitar mudança de controlado para não controlado
    setFormData({
      protocolo: '',
      entrada: '',
      marca: '',
      veiculo: '',
      placa: '',
      chassi: '',
      anoVeiculo: '',
      anoModelo: '',
      seguradora: '',
      codSinistro: '',
      numeroBO: '',
      ufSinistro: '',
      cidadeSinistro: '',
      colaborador: '',
      posicao: '',
      uf: '',
      cidade: '',
      numeroProcesso: '',
      tipo: '',
      situacao: '',
      // Novos campos
      cor: '',
      renavam: '',
      numeroMotor: '',
      // Campos condicionais para tipo Judicial
      comarca: '',
      numeroProcessoJudicial: '',
      notaFiscal: '',
      numeroVara: '',
      dataPagamento: '',
      honorario: '',
      nomeBanco: '',
      observacoes: ''
    });
    setPdfModalOpen(false);
    setSavedEntradaId(null);
    setError('');
    setSuccess('');
    setObservacoes([]);
    setNovaObservacao('');
    setValidatingPlaca(false);
    setPlacaSnackbar({
      open: false,
      message: '',
      severity: 'error'
    });
    // Limpar cache dos dropdowns
    clearCache();
    onClose();
  }, [onClose, clearCache]);

  // Estilo comum para campos de formulário
  const fieldSx = {
    '& .MuiInputLabel-root': {
      fontSize: { xs: '0.8rem', sm: '0.875rem' }
    },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.8rem', sm: '0.875rem' }
    },
    '& .MuiSelect-select': {
      fontSize: { xs: '0.8rem', sm: '0.875rem' }
    }
  };

  const renderFormContent = () => {
    return (
      <Box sx={{ width: '100%', mt: { xs: 1, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {/* Seção 1: Dados Básicos */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Dados Básicos do Veículo
            </Typography>
          </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Protocolo"
                  placeholder="Será gerado automaticamente (ID do registro)"
                  value={formData.protocolo}
                  onChange={handleInputChange('protocolo')}
                  variant="outlined"
                  size="small"
                  disabled
                  sx={fieldSx}
                />
              </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data de Entrada"
              type="date"
              value={formData.entrada}
              onChange={handleInputChange('entrada')}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Marca"
              value={formData.marca || ""}
              onChange={handleInputChange('marca')}
              options={marcas.map(marca => ({ value: marca, label: marca })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Veículo"
              value={formData.veiculo}
              onChange={handleInputChange('veiculo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Placa"
              placeholder="Digite a placa..."
              value={formData.placa}
              onChange={handlePlacaChange}
              onBlur={handlePlacaBlur}
              variant="outlined"
              size="small"
              autoComplete="off"
              helperText={validatingPlaca ? 'Verificando placa...' : ''}
              InputProps={{
                endAdornment: validatingPlaca ? (
                  <CircularProgress size={16} />
                ) : null
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Chassi"
              value={formData.chassi}
              onChange={handleInputChange('chassi')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Cor"
              value={formData.cor}
              onChange={handleInputChange('cor')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="RENAVAM"
              value={formData.renavam}
              onChange={handleInputChange('renavam')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número do Motor"
              value={formData.numeroMotor}
              onChange={handleInputChange('numeroMotor')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ano do Veículo"
              type="number"
              value={formData.anoVeiculo}
              onChange={handleInputChange('anoVeiculo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ano do Modelo"
              type="number"
              value={formData.anoModelo}
              onChange={handleInputChange('anoModelo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={fieldSx}
            />
          </Grid>

          {/* Seção 2: Informações do Sinistro */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1, 
                mt: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Informações do Sinistro
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Seguradora"
              value={formData.seguradora || ""}
              onChange={handleInputChange('seguradora')}
              options={seguradoras.map(seguradora => ({ value: seguradora, label: seguradora })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Código do Sinistro"
              value={formData.codSinistro}
              onChange={handleInputChange('codSinistro')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número B.O."
              value={formData.numeroBO}
              onChange={handleInputChange('numeroBO')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="UF do Sinistro"
              value={formData.ufSinistro || ""}
              onChange={handleUfSinistroChange}
              options={ufOptions || []}
              loading={loadingUfs}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              searchable={ufOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Cidade do Sinistro"
              value={formData.cidadeSinistro || ""}
              onChange={handleInputChange('cidadeSinistro')}
              options={cidadeSinistroOptions || []}
              loading={loadingCidadesSinistro}
              disabled={!formData.ufSinistro}
              loadingMessage="Carregando cidades..."
              emptyMessage={!formData.ufSinistro ? "Selecione primeiro uma UF" : "Nenhuma cidade disponível"}
              searchable={cidadeSinistroOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          {/* Seção 3: Atribuição e Localização */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1, 
                mt: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Atribuição e Localização
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Colaborador"
              value={formData.colaborador || ""}
              onChange={handleInputChange('colaborador')}
              options={colaboradorOptions || []}
              loading={loadingColaboradores}
              loadingMessage="Carregando colaboradores..."
              emptyMessage="Nenhum colaborador encontrado"
              searchable={colaboradorOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Posição"
              value={formData.posicao || ""}
              onChange={handleInputChange('posicao')}
              options={posicoes.map(posicao => ({ value: posicao, label: posicao })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="UF (Localização)"
              value={formData.uf || ""}
              onChange={handleUfLocalizacaoChange}
              options={ufOptions || []}
              loading={loadingUfs}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              searchable={ufOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Cidade (Localização)"
              value={formData.cidade || ""}
              onChange={handleInputChange('cidade')}
              options={cidadeLocalizacaoOptions || []}
              loading={loadingCidadesLocalizacao}
              disabled={!formData.uf}
              loadingMessage="Carregando cidades..."
              emptyMessage={!formData.uf ? "Selecione primeiro uma UF" : "Nenhuma cidade disponível"}
              searchable={cidadeLocalizacaoOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número do Processo"
              value={formData.numeroProcesso}
              onChange={handleInputChange('numeroProcesso')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Tipo"
              value={formData.tipo || ""}
              onChange={handleInputChange('tipo')}
              options={tipos.map(tipo => ({ value: tipo, label: tipo })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
            />
          </Grid>

          {/* Seção Condicional: Dados Judiciais */}
          {formData.tipo === 'JUDICIAL' && (
            <>
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold', 
                    mb: 1, 
                    mt: 1,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Dados Judiciais
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Comarca"
                  value={formData.comarca}
                  onChange={handleInputChange('comarca')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="N° Processo"
                  value={formData.numeroProcessoJudicial}
                  onChange={handleInputChange('numeroProcessoJudicial')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nota Fiscal"
                  value={formData.notaFiscal}
                  onChange={handleInputChange('notaFiscal')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="N° Vara"
                  value={formData.numeroVara}
                  onChange={handleInputChange('numeroVara')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="DT Pagto"
                  type="date"
                  value={formData.dataPagamento}
                  onChange={handleInputChange('dataPagamento')}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Honorário"
                  value={formData.honorario}
                  onChange={handleInputChange('honorario')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nome Banco"
                  value={formData.nomeBanco}
                  onChange={handleInputChange('nomeBanco')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

            </>
          )}

          {/* Seção 4: Observações em formato de Posts */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1, 
                mt: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Observações
            </Typography>
          </Grid>

          {/* Campo para adicionar nova observação */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 1.5 }, 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'flex-start' }
            }}>
            <TextField
              fullWidth
              label="Nova observação"
              multiline
              rows={2}
              value={novaObservacao}
              onChange={(e) => setNovaObservacao(e.target.value)}
              placeholder="Digite uma nova observação..."
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
              <Button
                variant="contained"
                onClick={adicionarObservacao}
                disabled={!novaObservacao.trim()}
                sx={{ 
                  minWidth: 'auto', 
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  height: { xs: 'auto', sm: '40px' },
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                Postar
              </Button>
            </Box>
          </Grid>

          {/* Lista de observações em formato de posts */}
          {observacoes.length > 0 && (
          <Grid item xs={12}>
              <Box sx={{ 
                maxHeight: { xs: 200, sm: 300 }, 
                overflow: 'auto', 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: { xs: 1, sm: 1.5 },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}>
                {observacoes.map((obs) => (
                  <Box
                    key={obs.id}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      mb: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 0.5, sm: 0 }
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {obs.autor}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        flexDirection: { xs: 'row', sm: 'row' }
                      }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {obs.data}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removerObservacao(obs.id)}
                          sx={{ 
                            minWidth: 'auto', 
                            p: { xs: 0.25, sm: 0.5 },
                            fontSize: { xs: '0.7rem', sm: '0.875rem' }
                          }}
                        >
                          ×
                        </Button>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {obs.texto}
                    </Typography>
                  </Box>
                ))}
              </Box>
          </Grid>
          )}

        </Grid>
      </Box>
    );
  };

  return (
        <BlurredDialog
          open={open}
          onClose={handleClose}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              height: { xs: '100vh', sm: '95vh' },
              maxHeight: { xs: '100vh', sm: '95vh' },
              width: { xs: '100vw', sm: '95vw', md: '90vw', lg: '85vw', xl: '80vw' },
              maxWidth: { xs: '100vw', sm: '95vw', md: '90vw', lg: '85vw', xl: '80vw' },
              margin: { xs: 0, sm: '2.5vh auto' },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: { xs: 0, sm: 1 }
            }
          }}
        >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0,
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            lineHeight: 1.2
          }}
        >
          Novo Registro de Entrada
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 }, 
          alignItems: 'center',
          flexDirection: { xs: 'row', sm: 'row' },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={preencherDadosADM}
            disabled={loading}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              py: { xs: 0.25, sm: 0.5 },
              px: { xs: 0.5, sm: 1 },
              minWidth: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            Preencher ADM
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={preencherDadosJudicial}
            disabled={loading}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              py: { xs: 0.25, sm: 0.5 },
              px: { xs: 0.5, sm: 1 },
              minWidth: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            Preencher Judicial
          </Button>
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ 
              p: { xs: 0.5, sm: 1 },
              '& .MuiSvgIcon-root': { fontSize: { xs: '1.2rem', sm: '1.5rem' } }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 1, flexShrink: 0 }}>
            {success}
          </Alert>
        )}

        {isReady ? (
          renderFormContent()
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" minHeight="400px">
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Carregando formulário...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Aguarde enquanto os dados são carregados
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        gap: { xs: 1, sm: 2 }, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        flexShrink: 0,
        justifyContent: { xs: 'stretch', sm: 'space-between' },
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        {/* Botão de anexar documentos no canto esquerdo */}
        <Button
          onClick={handleOpenPdfModal}
          variant="outlined"
          startIcon={<AttachFileIcon />}
          disabled={loading || !savedEntradaId}
          sx={{ 
            mr: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {!savedEntradaId ? 'Salve primeiro o registro' : 'Anexar Documentos'}
        </Button>

        {/* Botões de ação no canto direito */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Cancelar
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </Button>
        </Box>
      </DialogActions>

      <PdfModal
        open={pdfModalOpen}
        onClose={handleClosePdfModal}
        registroId={savedEntradaId}
      />

      {/* Snackbar para mensagens da placa */}
      <Snackbar
        open={placaSnackbar.open}
        autoHideDuration={6000}
        onClose={handleClosePlacaSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClosePlacaSnackbar} 
          severity={placaSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {placaSnackbar.message}
        </Alert>
      </Snackbar>
      
    </BlurredDialog>
  );
};

export default memo(NovoRegistroModal);
