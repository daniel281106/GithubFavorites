export class GithubUser {
  static Search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then((user) => user.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}
// faço a estrutura de dados  para começar a guardalos e carregar eles
export class Favorites {
  // crio o construtor para selecionar onde minha aplicaçao sera carregada
  constructor(root) {
    this.root = document.querySelector(root);
    // carrego meus dados para uso da interface
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }
  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }
  async add(username) {
    try {
        const userExists = this.entries.find(entry => entry.login === username);

        if(userExists) {
            throw new Error(`Usuairo: ${username} já existe`)
        }

      const user = await GithubUser.Search(username);

      if (user.login === undefined) {
        throw new Error(`Usuario ${username} não encontrado`);
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      console.log(error.message);
    }
  }

  delete(user) {
    // respeito a imutabilidade fazendo com que em vez de excluir um eu crio rapidamente uma nova interface onde contem menos uma node list
    const filterentries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    //quando eu faço o confirm ele retira um da node list com a decisao acima o filter detecta e retorna falso ja que a node list não e mais igual
    this.entries = filterentries;
    //faço o  update
    this.update();
    this.save();
  }
}
// logica
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("tbody");

    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector(".button-search");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".input-search");
      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `imagem de ${user.name}`;
      row.querySelector(".user p").textContent = `${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = `${user.login}`;
      row.querySelector(".repositories").textContent = `${user.public_repos}`;
      row.querySelector(".followers").textContent = `${user.followers}`;
      row.quer;

      row.querySelector(".delete").onclick = () => {
        const isok = confirm("você tem certeza que qeur deletar este?");
        if (isok) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }
  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td class="user">
            <img src="https://github.com/daniel281106.png" alt="">
            <a href="https://github.com/daniel281106">
                <p>daniel programmer</p>
                <span>daniel281106</span>
            </a>
        </td>
        <td class="repositories">
            76
        </td>
        <td class="followers">
            9650
        </td>
        <td>
            <button class="delete">&times;</button>
        </td>
        `;
    return tr;
  }
  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
