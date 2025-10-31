
const PAG_MAX = 1;

// Number of pages surrounding current page to display in
// pagination navigation
const PAG_NAV_NUM = 5;
//const PAG_NAV_NUM = 1;

const PAG_SEP = '...';

const model = {
    data: null,
    filterText: '',
    filter: [],
    loaded: false,
    error: '',
};

function getPagLinks(projects, current_page) {
    const num_pages = Math.ceil(projects.length/PAG_MAX);
    let links = [];
    let start = current_page - PAG_NAV_NUM;
    let end = current_page + PAG_NAV_NUM;

    if (start < 1)
        start = 1;
    if (end > num_pages)
        end = num_pages;

    for (let i = start; i < end+1; i++)
        links.push(i);

    if (!links.includes(1))
        links = [1, PAG_SEP].concat(links);

    if (!links.includes(num_pages)) {
        links.push(PAG_SEP);
        links.push(num_pages);
    }

    return links;
}

function getQueryParam(key) {
    const queryString = m.route.get().split('?')[1] || '';
    const params = m.parseQueryString(queryString);
    return params[key];
}

function findById(list, id) {
    return list.find(item => item.id === id);
}


function figureView(fig) {
    return m('details', [
               m('summary', fig.title),
               m('section', [
                   m('h3', 'Author'),
                   m('p', fig.author),
                   m('hr'),

                   m('h3', 'Title'),
                   m('p', fig.title),
                   m('hr'),

                   m('h3', 'Description'),
                   m('p', fig.description),
                   m('hr'),
                   m('p', {}, m('a', {href: `/figure-uploads/${fig.filename}`}, `${fig.filename}`)),

               ]),

           ]);
}


// case-insinsitve includes
function incl(str1, str2) {
    return str1.toLowerCase().includes(str2.toLowerCase())
}

function filterOnKeywords(figures) {
    function fltr(figure) {
        for (const kw of model.filter) {
            if (incl(figure.title, kw)) 
                return true;
            if (incl(figure.author, kw))
                return true;
            if (incl(figure.description, kw))
                return true;
            if (incl(figure.filename, kw))
                return true;

            for (const tag of figure.tags) {
                if (incl(tag, kw))
                    return true;
            }
            
        }
        return false;
    }

    if (model.filter.length === 0) {
        return figures;
    }

    return figures.filter(fltr);
}

function keywordFilterView() {
    function kd_cb(e) {
        if (e.key === 'Enter') {
            btn_cb(e);
        }
    }

    function txt_cb(e) {
        model.filterText = e.target.value;
    }

    function btn_cb(e) {
        e.preventDefault();

        model.filter = model.filterText.split(',')
                            .map(word => word.trim())
                            .filter(word => word.length > 0);

        m.route.set('');
        console.log(model);

    }

    function clear_cb(e) {
        e.preventDefault();
        model.filterText = '';
        model.filter = [];
        //model.statusFilter = 'all';
        m.route.set('');
    }

    function master_cb(e) {
        e.preventDefault();
        model.filterText = e.target.value;
        model.filter = model.filterText.split(',')
                            .map(word => word.trim())
                            .filter(word => word.length > 0);

        m.route.set('');
        console.log(model);
    }

    const lst= [
        m('span', {style: {'margin-right': '5px'}}, 'Filter projects by keywords:'),
        m('input', {type: 'text', size: 30, value: model.filterText, placeholder: 'Enter comma seprated keywords', oninput: master_cb}, null),
    ];
    return m('div#keyword-filter', {}, lst);
}

function init() {
    window.scrollTo(0, 0);
    if (model.data)
        return;

    const url = '/figures.json';
    //const url = 'https://run.mocky.io/v3/8f5a61f1-7928-4482-bfb8-5d17d3de018a';
    const headers = {};

    console.log("**** sending request **** " + url)
    return m.request({
        method: "GET",
        url: url,
        headers: headers,
    })
    .then(function(data){
        console.log("**** RESPONSE **** ", data);
        model.data = data;
        model.loaded = true;
    })
    .catch(function(e) {
        model.error = "Error loading data" + e;
    })
}

function paginationView(projects, current_page) {
    links = getPagLinks(projects, current_page); 

    const num_pages = Math.ceil(projects.length/PAG_MAX);
    
    if (num_pages < 2)
        return m('section#project-nav', {class: 'pagination'}, null);

    let previous_page = current_page - 1;
    let next_page = current_page + 1;

    const prev_attr = {href: `#/?page=${previous_page}`}
    const next_attr = {href: `#/?page=${next_page}`};
    const disable = {'pointer-events': 'none', color: 'gray'}

    if (previous_page <= 0)
        prev_attr.style = disable;

    if (next_page > num_pages)
        next_attr.style = disable;

    const lst = [];
    lst.push(m('li', {}, m('a', prev_attr, '« Previous')));
    for(const i of links) {
        if (i === PAG_SEP) {
            lst.push(m('li', {}, PAG_SEP));
            continue;
        }
        const attr = {href: `#/?page=${i}`};
        if (i === current_page){
            attr.class = 'active';
        }
        lst.push(m('li', {}, m('a', attr, i)));
    }

    lst.push(m('li', {}, m('a', next_attr, 'Next »')));

    return m('section#project-nav', {class: 'pagination'}, 
               m('ul', {}, lst));
}

function homeView() {
    if (model.error) {
        return m("div", model.error);
    }
    if (!model.loaded) {
        return m("div.loader");
    }

    let current_page = parseInt(getQueryParam('page'));
    if (! current_page)
        current_page = 1;


    /*

    const featuredProject = getFeatured(model.data);

    let projects = getUnFeatured(model.data);

    projects = filterOnKeywords(projects);
    projects = filterOnStatus(projects);

    const start = PAG_MAX*(current_page - 1);
    const end = PAG_MAX*current_page;

    const paginated_projects = projects.slice(start, end);

    return [
        m('h2', {style: {'margin-top': '0px'}}, 'Water Projects'),
        m('h3', {style: {'text-align': 'left'}}, 'Featured Project'),
        //featuredView(featuredProject),
        featuredProjectView(featuredProject),
        //m('hr', {style: {'background-color': 'black', height: '2px', border: 'none'}}),
        m('hr'),
        keywordFilterView(),
        statusFilterView(),
        //mainView(projects),
        mainView(paginated_projects),
        paginationView(projects, current_page),
    ]
    */
    //return m('h1', 'hello!');

    const filteredFigures = filterOnKeywords(model.data);

    const figures = filteredFigures.map(figureView);

    return [
        keywordFilterView(),
        m('div', {}, figures),
    ];
    //return figureView(model.data[0]);
            
}

// generic view that turns a js list
// into an html list.
function listView(lst) {
    const l = [];
    for (const item of lst) {
        l.push(m('li', {}, item));
    }
    return m('ul', {}, l);
}

function detailView() {
    if (model.error) {
        return m("div", model.error);
    }
    if (!model.loaded) {
        return m("div.loader");
    }

    const id = parseInt(m.route.param("id"));

    const prj = findById(model.data, id);

    function cb(e) {
        e.preventDefault();
        window.history.back();
    }

  return m("div.container", [
    m('header', m('h2', {style: {'margin-top': '0px'}}, prj.title)),
    m("a.back-button", {href: '#', onclick: cb}, "← Back"),

    prj.image_url && m("div.image-container", [
      m("img", { src: prj.image_url, alt: "Project Image", onclick: cb})
    ]),

    prj.summary && m("section.prj", [
      m("h2", "Summary"),
      m("p", prj.summary)
    ]),

    prj.description && m("section.prj", [
      m("h2", "Description"),
      m("p", prj.description)
    ]),

    prj.water_topics && prj.water_topics.length && m("section.prj", [
      m("h2", "Water Topics"),
      m("ul", prj.water_topics.map(topic => m("li", topic)))
    ]),

    prj.basins && prj.basins.length && m("section.prj", [
      m("h2", "Basins"),
      m("ul", prj.basins.map(basin => m("li", basin)))
    ]),

    prj.nasa_eo && prj.nasa_eo.length && m("section.prj", [
      m("h2", "NASA Earth Observation"),
      m("ul", prj.nasa_eo.split(',').map(obs => m("li", obs)))
    ]),

    prj.partners && prj.partners.length && m("section.prj", [
      m("h2", "Partners"),
      m("ul", prj.partners.split(',').map(partner => m("li", partner)))
    ]),

    prj.leads && prj.leads.length && m("section.prj", [
      m("h2", "Leads"),
      m("ul", prj.leads.split(',').map(lead => m("li", lead)))
    ]),

    prj.impact_statement && m("section.prj", [
      m("h2", "Impact Statement"),
      m("p", prj.impact_statement)
    ]),
    m("a.back-button", {href: '#', onclick: cb}, "← Back"),
  ]);
}


document.addEventListener("DOMContentLoaded", function () {
  m.route.prefix = "#/";
  
  m.route(document.getElementById("fig"), "/", {
    "/": { view: homeView, oninit: init},
    "/project/:id": { view: detailView, oninit: init},
  });
});

