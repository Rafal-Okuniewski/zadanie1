
# Programowanie full-stack w chmurze obliczeniowej - Sprawozdanie 2

Rafał Okuniewski

Nr albumu: 99175


## Zadanie 1

Proszę napisać program serwera (dowolny język programowania), który realizować będzie następującą funkcjonalność:
a)	po uruchomieniu kontenera, serwer pozostawia w logach informację o dacie uruchomienia, imieniu i nazwisku autora serwera (imię i nazwisko studenta) oraz porcie TCP, na którym serwer nasłuchuje na zgłoszenia klienta.
b)	na podstawie adresu IP klienta łączącego się z serwerem, w przeglądarce powinna zostać wyświetlona strona informująca o adresie IP klienta i na podstawie tego adresu IP, o dacie i godzinie w jego strefie czasowej.

### server.js

```
'use strict';

const express = require('express');
const requestIp = require('request-ip');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  var clientIp = requestIp.getClientIp(req);
  res.send('Client IP address: ' + clientIp + ' | Client date: ' + new Date().toLocaleString());
});

app.listen(PORT, HOST);
console.log("Start time: " + new Date());
console.log("Author: Rafał Okuniewski");
console.log(`Running on http://${HOST}:${PORT}`);
```


## Zadanie 2
Opracować plik Dockerfile, który pozwoli na zbudowanie obrazu kontenera realizującego funkcjonalność opisaną w punkcie 1. Przy ocenie brane będzie sposób opracowania tego pliku (dobór obrazu bazowego, wieloetapowe budowanie obrazu, ewentualne wykorzystanie warstwy scratch, optymalizacja pod kątem funkcjonowania cache-a w procesie budowania). Dockerfile powinien również zawierać informację o autorze tego pliku (ponownie imię i nazwisko studenta).

### Dockerfile

```
ARG VERSION=1.10
FROM node AS build
ARG VERSION
RUN mkdir -p /var/node
WORKDIR /var/node
ADD . ./
RUN npm install

FROM node:fermium-alpine3.15
ENV NODE_ENV="production_${VERSION}"
COPY --from=build /var/node /var/node
WORKDIR /var/node
EXPOSE 8080

RUN echo "Author: Rafał Okuniewski"
CMD [ "node", "server.js" ]
```

## Zadanie 3
Należy podać polecenia niezbędne do: 

a)	zbudowania opracowanego obrazu kontenera, 
```
docker build -t s99175/zadanie1 .
```
![alt text](images/a3.png)

b)	uruchomienia kontenera na podstawie zbudowanego obrazu,
```
docker run -p 8080:8080  --name zadanie1 s99175/zadanie1
```
![alt text](images/b3.png)
 
c)	sposobu uzyskania informacji, które wygenerował serwer w trakcie uruchamiana kontenera (patrz: punkt 1a), 
```
docker logs zadanie1
```
![alt text](images/c3.png)
 
 
d)	sprawdzenia, ile warstw posiada zbudowany obraz.
```
docker image inspect s99175/zadanie1 
```
![alt text](images/d3_1.png)

```
docker history s99175/zadanie1
```
![alt text](images/d3_2.png)


Widok z przeglądarki: http://localhost:8080/

![alt text](images/d3_3.png)



## Zadanie 4

Zbudować obrazy kontenera z aplikacją opracowaną w punkcie nr 1, które będą pracował na architekturach: linux/arm/v7, linux/arm64/v8 oraz linux/amd64. Obrazy te należy przesłać do swojego repozytorium na DockerHub. W sprawozdaniu należy podać wykorzystane instrukcje wraz z wynikiem ich działania I ewentualnymi komentarzami.

DockerHub: https://hub.docker.com/r/s99175/zadanie1/tags

```
docker buildx build -t s99175/zadanie1:v1 --platform linux/arm/v7,linux/arm64/v8,linux/amd64 --push .
```

![alt text](images/4.png)

## Część dodatkowa 

Wykonać punkt 4:
- z wykorzystaniem GitHubActions

Plik frontend.yml

```
name: GitHub Action

on:
  push:
    branches: [master]

jobs:
  build-push-images:
    name: Budowa i publikacja obrazu z zadania 1 na repozytorium
    runs-on: ubuntu-latest

    steps:

      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2
        with:
          platforms: linux/arm/v7,linux/arm64/v8,linux/amd64

      - name: Set up Docker Buildx
        id: buildx
        uses: docker/setup-buildx-action@master

      - name: Login to DockerHub
        uses: docker/login-action@v1 
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: Login to Github Packages
        uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GHCR_PAT }}

      - name: Build and push
        id: docker_build
        uses: docker/build-push-action@v2
        with:
          context: ./
          file: ./Dockerfile
          push: true
          platforms: linux/arm/v7,linux/arm64/v8,linux/amd64
          tags: |
            s99175/zadanie1:v1
            ghcr.io/rafal-okuniewski/zadanie1:v1
```

Ustawienie sekretów logowania do DockerHub i GitHub Container Registry
![alt text](images/extra1.png)

Wyświetlenie poprawnego procesu budowania przygotowanego obrazu według parametrów wskazanych w zadaniu.

![alt text](images/extra3.png)

- z przesłaniem danych nie na DockerHub a na repozytorium GitHub wraz z krótkim opisem konfiguracji GitHub Container Registry

Budowanie zostało skonfigurowane tak, aby wysyłać obraz na GitHub Container Registry oraz DockerHub. Dodanie przesyłania obrazu na Github Container Registry wiązało się z dodaniem klucza logowania do tej platformy jako sekretu oraz dodania sekcji logowania w pliku z rozszerzeniem .yml wraz z sekcją podania repozytorium oraz taga. 

### Logowanie
```
- name: Login to Github Packages
uses: docker/login-action@v1
with:
  registry: ghcr.io
  username: ${{ github.actor }}
  password: ${{ secrets.GHCR_PAT }}
```
### Dodanie taga
```
ghcr.io/rafal-okuniewski/zadanie1:v1
```

### Repozytoria

DockerHub: https://hub.docker.com/r/s99175/zadanie1/tags

GitHub Container Registry: https://github.com/users/Rafal-Okuniewski/packages/container/package/zadanie1