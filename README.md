# AgendaPrataNet

Agenda operacional para organizar ordens de servico, equipes e bairros atendidos pela PrataNet.

![Tela inicial da AgendaPrataNet](assets/images/tela-inicial.png)

## Sobre o projeto

O AgendaPrataNet substitui o controle manual em planilhas por uma interface para planejar atendimentos e evitar conflitos de rota entre equipes.

## Funcionalidades

- Tela de login demonstrativa para identificar o operador.
- Dashboard com resumo das ordens do dia.
- Calendario mensal com navegacao entre meses.
- Cadastro de ordens de servico com:
  - Numero da OS
  - Tipo de servico
  - Nome do cliente
  - Bairro
  - Data do atendimento
  - Equipe responsavel
  - Periodo de atendimento
- Periodos disponiveis:
  - Manha: 08:00 - 12:00
  - Tarde: 13:00 - 18:00
- Limite de 3 ordens de servico por periodo.
- Bloqueio de equipes duplicadas no mesmo periodo.
- Bloqueio de equipes diferentes no mesmo bairro e dia.
- Selecao individual de Gilson, Willian ou Vinicius para a equipe terceirizada.
- Historico das alteracoes realizadas.
- Persistencia dos dados no `localStorage` do navegador.
- Interface responsiva para desktop e celular.

## Equipes cadastradas

- Equipe 4
- Equipe 9
- Equipe 10
- Equipe terceirizada:
  - Gilson
  - Willian
  - Vinicius

## Estrutura

```text
projetoagendapratanet/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── images/
    │   ├── logomarca_pratanet_2021_icone.png
    │   ├── logopaginadelogin.png
    │   └── tela-inicial.png
    └── js/
        └── main.js
```

## Como executar localmente

1. Clone o repositorio:

```bash
git clone https://github.com/viniciusgcampanella/agendapratanet.git
cd agendapratanet
```

2. Abra o arquivo `index.html` no navegador.

Tambem e possivel usar a extensao Live Server do VS Code para uma experiencia melhor durante o desenvolvimento.

## Publicacao

O projeto pode ser publicado pelo GitHub Pages usando a branch `main` como fonte.

URL publicada:

https://viniciusgcampanella.github.io/agendapratanet/

## Observacao

Esta versao e um prototipo frontend. O login e demonstrativo e os registros ficam armazenados localmente no navegador. Para uso em producao, sera necessario integrar um backend, autenticacao real e um banco de dados compartilhado entre os operadores.
