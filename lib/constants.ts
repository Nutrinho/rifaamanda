import type { Campaign } from "./types";

export const defaultCampaign: Campaign = {
  id: "00000000-0000-0000-0000-000000000001",
  title: "Rifa Solidária — Ajude a Amanda a viver sem dor",
  beneficiary_name: "Amanda Lavínia",
  story:
    "Meu nome é Amanda Lavínia, tenho 29 anos, moro em Caçador/SC e hoje estou enfrentando a maior batalha da minha vida. Há 5 meses convivo com uma hérnia de disco de 13mm na coluna, causando dores intensas e constantes. A dor se tornou incapacitante. Hoje não consigo trabalhar, sair de casa, sentar, ficar em pé ou até mesmo realizar tarefas simples sem sofrimento.",
  surgery_text:
    "Após diversas tentativas de tratamento, os médicos informaram que a única solução para o meu caso é a cirurgia. O valor total é de R$ 18.000,00, incluindo hospital, equipe médica, anestesia, exames e pós-operatório.",
  hope_text:
    "Sou uma menina guerreira, estudosa e cheia de sonhos. Formada em Engenharia Ambiental, sempre corri atrás dos meus objetivos com dedicação. Hoje, estou completamente parada pela dor e dependo da ajuda dos familiares até para coisas simples.",
  goal_amount: 18000,
  ticket_price: 10,
  total_numbers: 1000,
  pix_key: "cadastre-a-chave-pix-no-admin",
  pix_receiver_name: "Amanda Lavínia",
  whatsapp_contact: "5549999999999",
  draw_date: null,
  image_url: "/images/amanda-lavinia.png",
  legal_notice:
    "Esta campanha deve seguir as regras aplicáveis para sorteios, rifas e ações beneficentes. Consulte a organização responsável para informações sobre regulamento, autorização, data do sorteio e prestação de contas. No Brasil, distribuições de prêmios, promoções comerciais e sorteios filantrópicos podem exigir autorização e documentação específica em sistemas oficiais, como o SCPC/Ministério da Fazenda ou canais indicados pela Caixa/Governo Federal.",
  authorization_number: null,
  regulation_url: null
};

export const painItems = [
  "Fazer nada sozinha",
  "Ir ao banheiro e tomar banho sem muita dor",
  "Viver dias difíceis, de choro e dor constante",
  "Trabalhar normalmente"
];

export const prizeItems = [
  "Fone de ouvido Bluetooth",
  "Caixa de som Bluetooth",
  "Garrafa térmica",
  "Copo térmico",
  "Power Bank 5000mAh"
];
