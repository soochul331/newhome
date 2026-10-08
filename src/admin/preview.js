/* Live previews reuse the production Nunjucks templates and stylesheet. */
(function () {
  const ready = fetch('/admin/preview-data.json').then(r => {
    if (!r.ok) throw new Error('미리보기 자료를 불러오지 못했습니다.');
    return r.json();
  });
  const markdown = window.markdownit({ html: false, linkify: true });
  function environment(templates) {
    const Loader = nunjucks.Loader.extend({ getSource(name) {
      if (!(name in templates)) throw new Error('알 수 없는 섹션: ' + name);
      return { src: templates[name], path: name, noCache: true };
    }});
    const env = new nunjucks.Environment(new Loader(), { autoescape: true });
    env.addFilter('enabled', a => (a || []).filter(x => x.enabled !== false));
    env.addFilter('visible', a => (a || []).filter(x => x.visible !== false));
    env.addFilter('isoDate', d => new Date(d).toISOString().slice(0, 10));
    env.addFilter('dateKo', d => new Date(d).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' }));
    return env;
  }
  function preview(name) {
    return createClass({
      getInitialState() { return { base: null, error: '' }; },
      componentDidMount() {
        this.alive = true;
        ready.then(base => { if (this.alive) this.setState({ base }); })
          .catch(error => { if (this.alive) this.setState({ error: error.message }); });
      },
      componentWillUnmount() { this.alive = false; },
      render() {
        if (!this.state.base) return h('p', {}, this.state.error || '홈페이지 미리보기를 불러오는 중…');
        try {
          const context = JSON.parse(JSON.stringify(this.state.base));
          const value = this.props.entry.get('data').toJS();
          if (['site', 'home', 'navigation'].includes(name)) context[name] = value;
          const env = environment(context.templates);
          context.page = { url: '/' };
          let content;
          if (name === 'pages' || name === 'posts') {
            Object.assign(context, value, { content: markdown.render(value.body || '') });
            context.page.url = value.permalink || '/preview/';
            content = env.render(name === 'pages' ? 'page.njk' : 'post.njk', context);
          } else {
            content = (context.home.sections || []).filter(s => s.enabled !== false).map(s => {
              if (s.type === 'richtext') s.body = markdown.render(s.body || '');
              return env.render('sections/' + s.type + '.njk', { ...context, s });
            }).join('');
          }
          let html = env.render('base.njk', { ...context, content });
          // Preview is inert: no scripts, form submissions, or navigation.
          html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace('<head>', '<head><base href="' + location.origin + '/"><style>a,button,input,textarea{pointer-events:none}html{scroll-behavior:auto}</style>');
          return h('div', {},
            h('p', { style: { margin:0, padding:'10px', background:'#eaf0ff', fontSize:'13px' } }, '실시간 미리보기 · 입력 즉시 반영 · 공개하려면 저장 후 게시하세요'),
            h('iframe', { title:'홈페이지 실시간 미리보기', sandbox:'', srcDoc:html, style:{ width:'100%', height:'calc(100vh - 150px)', border:0, background:'white' } }));
        } catch (error) {
          return h('p', {}, '입력 내용을 확인해 주세요: ' + error.message);
        }
      }
    });
  }
  CMS.registerPreviewStyle('body{margin:0;padding:0}iframe{display:block}', { raw:true });
  ['site', 'navigation', 'home', 'pages', 'posts'].forEach(name => CMS.registerPreviewTemplate(name, preview(name)));
})();
