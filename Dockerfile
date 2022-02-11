FROM node:current-stretch

WORKDIR /usr/src/bot

COPY package*.json ./
COPY LeviBot.data.json ./

#install chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list 

RUN apt update

RUN apt install google-chrome-stable fonts-freefont-ttf libxss1 --no-install-recommends -y \
    && rm -rf /var/lib/apt/lists/*

RUN apt upgrade -y

# skip the puppeteer browser download
ENV PUPPETEER_SKIP_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome

RUN npm i

COPY . .

CMD ["npm", "start"]