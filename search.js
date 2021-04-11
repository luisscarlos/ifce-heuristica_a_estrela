class BFS {
  larguraGrade = 480;
  alturaGrade = 480;
  paddingGrade = 20;
  tamanhoCelula = 40;
  canvas = document.getElementById("canvas");
  context = this.canvas.getContext("2d");

  alcancavel = [];
  explorado = [];
  caminho = [];
  noInicio = {};
  noFinal = {};
  parede = [{x: 7, y: 6},
            {x: 6, y: 6}, 
            {x: 5, y: 6},
            {x: 4, y: 6},
            {x: 3, y: 6},
            {x: 7, y: 7}, 
            {x: 7, y: 8}, 
            {x: 8, y: 8}, 
            {x: 9, y: 8}, 
            {x: 10, y: 8}, 
            {x: 10, y: 6}, 
            {x: 11, y: 6},
            {x: 7, y: 5},
            {x: 12, y: 6}];

  cores = {tabuleiro: '#EAE7E1', 
           noInicio: '#214ECA', 
           noFinal: '#E52E2E', 
           adjacent: '#00A30E', 
           explorado: '#878787', 
           caminho: '#6CA1DA', 
           parede: '#993A15'};

  constructor(noInicio, noFinal) {
      // Limpa canvas
      this.limpaCanvas();

      // Adiciona nó inicial
      this.alcancavel.push({atual: noInicio, anterior: {}});
      this.noFinal = noFinal;

      this.fillNode(noInicio, this.cores.noInicio);
      this.fillNode(noFinal, this.cores.noFinal);
      this.context.fillStyle = 'black';

      this.desenhaTabuleiro();
      this.desenhaParedes();
      this.encontraCaminho();
      BFS.desativaExecutar(true);
  }

  async encontraCaminho() {
      let noAnterior = {};
      let i = 0;
      while (this.alcancavel.length) {
          // Diminui a velocidade de execução da busca para conseguir vizualizar o passo a passo
          await BFS.wait();
          let nodeData = this.chooseNode(),
              node = nodeData.atual;

          if ( BFS.objetosSaoIguais(node, this.noFinal)) {
              BFS.desativaExecutar(false);
              return this.constroiCaminho(nodeData);
          }
          this.explorado.push({atual: node, anterior: nodeData.anterior, direction: nodeData.direction});
          document.querySelector('.breadth-search-container .explorado .explorado-list').innerHTML = JSON.stringify(this.explorado);

          if (i > 0) {
              this.fillNode(node, this.cores.explorado);
          }

          this.getAdjacente(node);
          document.querySelector('.breadth-search-container .alcancavel .alcancavel-list').innerHTML = JSON.stringify(this.alcancavel);

          noAnterior = node;
          i++;
      }
  }

  chooseNode() {
      return this.alcancavel.shift();
  }

  getAdjacente(node) {
      let nosAdjacentes = [];
      if (node.x - 1 > 0 ) { 
          nosAdjacentes.push({x: node.x - 1, y: node.y});
      }
      if (node.x + 1 <= this.larguraGrade / this.tamanhoCelula ) {
          nosAdjacentes.push({x: node.x + 1, y: node.y});
      }
      if (node.y - 1 > 0 ) {
          nosAdjacentes.push({x: node.x, y: node.y - 1});
      }
      if (node.y + 1 <= this.alturaGrade / this.tamanhoCelula) {
          nosAdjacentes.push({x: node.x, y: node.y + 1});
      }

      const self = this;
      nosAdjacentes.forEach( (adjacentNode) => {
          if (!self.isexplorado(adjacentNode) && !BFS.objetoEstaIncluso(self.parede, adjacentNode)) {
              if (!BFS.objetosSaoIguais(adjacentNode, self.noFinal)) {
                  self.fillNode(adjacentNode, self.cores.adjacent);
              }
              self.alcancavel.push({atual: adjacentNode, anterior: node});
          }
      });
  }

  constroiCaminho(node) {
      this.caminho.push(this.noFinal);
      while (node) {
          let noAnterior = this.explorado.find((e) => BFS.objetosSaoIguais(e.atual, node.anterior));
          if (noAnterior == null) {
              break;
          }

          node = noAnterior;
          if (JSON.stringify(node.anterior) !== JSON.stringify(this.noInicio)) {
              this.fillNode(node.atual, this.cores.caminho);
          }
          this.caminho.push(noAnterior.atual);
      }
      document.querySelector('.breadth-search-container .caminho .caminho-list').innerHTML = JSON.stringify(this.caminho.reverse());
  }

  desenhaTabuleiro() {
      // horizontal
      let i = 1;
      for (let x = 0; x <= this.alturaGrade; x += this.tamanhoCelula) {
          this.context.moveTo(this.paddingGrade, 0.5 + x + this.paddingGrade);
          this.context.lineTo(this.larguraGrade + this.paddingGrade, 0.5 + x + this.paddingGrade);
          if (i <= this.larguraGrade/this.tamanhoCelula) {
              this.context.font = "20px Arial";
              this.context.fillText(i, x + this.tamanhoCelula / 2 + this.paddingGrade / 2, this.paddingGrade-5);
              i++;
          }
      }
      // vertical
      i = 1;
      for (let x = 0; x <= this.larguraGrade; x += this.tamanhoCelula) {
          this.context.moveTo(0.5 + x + this.paddingGrade, this.paddingGrade);
          this.context.lineTo(0.5 + x + this.paddingGrade, this.alturaGrade + this.paddingGrade);

          if (i <= this.larguraGrade/this.tamanhoCelula) {
              this.context.font = "20px Arial";
              this.context.fillText(i, 0, x + this.tamanhoCelula / 2 + this.paddingGrade + 5);
              i++;
          }
      }
      this.context.strokeStyle = "black";
      this.context.stroke();
  }

  desenhaParedes() {
      for (let node of this.parede) {
          this.fillNode(node, this.cores.parede);
      }
  }

  fillNode(node, color) {
      this.context.fillStyle = color;
      this.context.fillRect(this.tamanhoCelula * (node.x - 1) + this.paddingGrade,this.tamanhoCelula * (node.y - 1) + this.paddingGrade, this.tamanhoCelula, this.tamanhoCelula);
      this.context.stroke();
  }

  isexplorado(node) {
      return (this.alcancavel.filter(e => BFS.objetosSaoIguais(e.atual, node)).length > 0 ||
          this.explorado.filter(e => BFS.objetosSaoIguais(e.atual, node)).length > 0)
  }

  limpaCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = this.cores.tabuleiro;
      this.context.fillRect(this.paddingGrade, this.paddingGrade, this.larguraGrade, this.alturaGrade);
      document.querySelector('.breadth-search-container .caminho .caminho-list').innerHTML = '...';
  }

  static objetosSaoIguais(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  static desativaExecutar(disabled = true) {
      document.querySelector('#start-button').disabled = disabled;
  }

  static objetoEstaIncluso(array, obj) {
      for(let i = 0; i < array.length; i++) {
          if (BFS.objetosSaoIguais(array[i], obj)) {
              return true;
          }
      }
      return false;
  }

  static wait() {
      return new Promise(function(resolve) {
          setTimeout(resolve, 10);
      });
  }
}

function start() {
  let xStart = parseInt(document.getElementById('x_start').value),
      yStart = parseInt(document.getElementById('y_start').value),
      xGoal = parseInt(document.getElementById('x_goal').value),
      yGoal = parseInt(document.getElementById('y_goal').value);
  const map = new BFS({x: xStart,y: yStart}, {x: xGoal, y: yGoal});
}

window.addEventListener("load", () => {
  const map = new BFS({x: 5,y: 2}, {x: 9, y: 11});
});