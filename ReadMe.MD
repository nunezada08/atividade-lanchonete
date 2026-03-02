# 🍔 Sistema Backend para Lanchonete "Sabor & Código"

> Nossa equipe foi contratada para desenvolver somente o API REST desenvolvida para o gerenciamento de clientes, produtos e pedidos de uma lanchonete, aplicando rigorosamente Arquitetura MVC, Clean Code e integração com APIs externas.


## 🎯 Contexto

> Este projeto consiste no desenvolvimento exclusivo do backend (API REST) do sistema "Sabor & Código". O objetivo é entregar uma aplicação robusta baseada no template fornecido, garantindo boas práticas de desenvolvimento, aplicação estrita de regras de negócio, tratamento adequado de erros e código limpo.

---


## 🏗 Arquitetura e Estrutura de Pastas

O projeto segue o padrão **MVC (Model-View-Controller)** adaptado para APIs, garantindo separação de responsabilidades:

```text
src/
 ├── controllers/ # Validações, comunicação HTTP e respostas padronizadas.
 ├── models/      # Regras de negócio, filtros e acesso ao banco de dados.
 ├── routes/      # Definição e roteamento dos endpoints.
 ├── utils/       # Funções auxiliares (ex: formatação, utilitários).
 └── server.js    # Ponto de entrada da aplicação.
