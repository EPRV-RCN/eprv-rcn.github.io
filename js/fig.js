
const PAG_MAX = 5;

// Number of pages surrounding current page to display in
// pagination navigation
const PAG_NAV_NUM = 5;
//const PAG_NAV_NUM = 1;

const PAG_SEP = '...';

const model = {
    data: null,
    filterText: '',
    filter: [],
    openStates: {},
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
    // We need a title for display.
    if (!('title' in fig && fig.title)) {
        fig.title = 'No Title'
    }

    return m('details', {open: model.openStates[fig.id] || false, ontoggle: e => {model.openStates[fig.id] = e.target.open}}, [
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
                   //m('p', {}, m('a', {href: `/figure-uploads/${fig.image_file}`}, `${fig.image_file}`)),
                   m('p', {}, m('a', {href: `#/figure/${fig.id}`}, 'View →')),


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
            if ('title' in figure && incl(figure.title, kw)) 
                return true;
            if ('author' in figure && incl(figure.author, kw))
                return true;
            if ('description ' in figure && incl(figure.description, kw))
                return true;

            if ('tags' in figure) {
                for (const tag of figure.tags) {
                    if (incl(tag, kw))
                        return true;
                }
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
    }

    const lst= [
        m('span', {style: {'margin-right': '5px'}}, 'Filter by keywords:'),
        m('input', {type: 'text', size: 30, value: model.filterText, placeholder: 'Enter comma seprated keywords', oninput: master_cb}, null),
    ];
    return m('div#keyword-filter', {}, lst);
}

function addID(lst) {
    const out = JSON.parse(JSON.stringify(lst));
    for (const [index, value] of out.entries()) {
        value.id = index + 1;
    }
    return out;
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
        return m('section#figure-nav', {class: 'pagination'}, null);

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

    return m('section#figure-nav', {class: 'pagination'}, 
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


    const filteredFigures = filterOnKeywords(model.data);
    const start = PAG_MAX*(current_page - 1);
    const end = PAG_MAX*current_page;
    const paginatedFigures = filteredFigures.slice(start, end);

    //const figures = filteredFigures.map(figureView);
    const figures = paginatedFigures.map(figureView);

    return [
        m('h2', {style: {'text-align': 'center', 'margin-bottom': '50px'}}, 'Figures and Animations'),
        keywordFilterView(),
        m('div', {}, figures),
        paginationView(filteredFigures, current_page),
    ];
}

// generic view that converts a js list
// into an html list.
function listView(lst) {
    const l = [];
    for (const item of lst) {
        l.push(m('li', {}, item));
    }
    return m('ul', {}, l);
}

function imageView(fig) {
    return m("div.image-container", [
        m('a', {href: `/figure-uploads/${fig.image_file}`, target: '_blank'}, 
            m('div', {style: {'text-align': 'center'}}, m('em', 'View raw image file')),
            m("img", { src: `/figure-uploads/${fig.image_file}`, alt: "Figure", style: {display: 'block', margin: '0 auto'}}))
    ])
}

function embedView(fig) {
    function toEmbedUrl(url) {
        const match = url.match(
          /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
        );
        if (!match) return null;
        const videoId = match[1];
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    const att = {
        id: 'videoPlayer',
        width: '560',
        height: '315',
        src: `${toEmbedUrl(fig.video_url)}`,
        //src: `${fig.video_url.replace('youtube.com', 'youtube-nocookie.com')}`,
        //src: `https://www.youtube-nocookie.com/embed/0FEUxQHLlrw?si=9QpriMuNEdCKxehY`,
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true
    };

    return m('div.video-container', m('iframe', att) );;
}

function mp4View(fig) {
    const st = {
        width: "100%",
        height: "auto",
        display: "block",
    }

    const att = {
        autoplay: true,
        loop: true,
        muted: true,
        playsinline: true,
        style: st,
    };

    return m('video', att, 
               m('source', {src: `/figure-uploads/${fig.mp4_file}`, type: 'video/mp4'}));
}

function detailView() {
    if (model.error) {
        return m("div", model.error);
    }
    if (!model.loaded) {
        return m("div.loader");
    }

    const id = parseInt(m.route.param("id"));

    const fig = findById(model.data, id);

    function cb(e) {
        e.preventDefault();
        window.history.back();
    }

    let vdom = m('div', 'No content available');

    if ('image_file' in fig && fig.image_file) {
        vdom = imageView(fig);
    }
    else if ('video_url' in fig && fig.video_url) {
        vdom = embedView(fig);
    }
    else if ('mp4_file' in fig && fig.mp4_file) {
        vdom = mp4View(fig);
    }

    return m("div.container", [
        m('div', m("a.back-button", {href: '#', onclick: cb}, "← Back")),
        m('h3', {style: {'text-align': 'center', 'margin-bottom': '50px'}}, `${fig.title}`),
        vdom,
        //m('div', m("a.back-button", {href: '#', onclick: cb}, "← Back")),
        ]);
    }


document.addEventListener("DOMContentLoaded", function () {
  m.route.prefix = "#/";
  
  m.route(document.getElementById("fig"), "/", {
    "/": { view: homeView, oninit: init},
    "/figure/:id": { view: detailView, oninit: init},
  });
});

