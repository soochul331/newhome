/* Decap custom list widget: draft changes use the normal CMS save/publish path. */
(function () {
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value?.toJS ? value.toJS() : value));
  const get = (object, path) => path.reduce((v,k) => v?.[k], object);
  const set = (object, path, value) => { const last = path[path.length-1]; path.slice(0,-1).forEach(k => { object = object[k] ||= {}; }); object[last] = value; };
  CMS.registerWidget('visualappearance',createClass({render(){return h('p',{},'서식은 화면에서 요소를 선택해 조절합니다.');}}));
  const controls = new Map();
  const published = new Map();
  const savedRoutes = new Set();
  let pendingSave = null, activeCanvas = null;
  const saved = ({entry}) => {
    if(!pendingSave) return;
    const pending=pendingSave; pendingSave=null;
    published.set(pending.mode,clone(entry.get('data')));
    savedRoutes.add(pending.route);
    if(activeCanvas?.alive && activeCanvas.mode===pending.mode) activeCanvas.setState({status:'저장 완료 · 홈페이지에 반영 중입니다.'});
  };
  CMS.registerEventListener({name:'postSave',handler:saved});
  CMS.registerEventListener({name:'postPublish',handler:saved});
  ['text','string','list','boolean','number','image','select','datetime','markdown','object','visualappearance'].forEach(name => {
    const widget = CMS.getWidget(name);
    if (!widget) return;
    CMS.registerWidget('canvas'+name, createClass({
      componentDidMount() { controls.set(this.props.field.get('name'),this); },
      componentDidUpdate() { controls.set(this.props.field.get('name'),this); },
      componentWillUnmount() { if (controls.get(this.props.field.get('name')) === this) controls.delete(this.props.field.get('name')); },
      render() { return h(widget.control,{...this.props,field:this.props.field.set('widget',name)}); }
    }),widget.preview,widget.schema);
  });
  const appearanceOf = (draft,target,create = false) => {
    const section = target.index != null ? draft.sections[target.index] : draft;
    const owner = ['items','links'].includes(target.path?.[0]) ? section[target.path[0]][target.path[1]] : section;
    return owner.appearance || (create ? (owner.appearance = {}) : {});
  };
  const labels = {title:'큰 제목',heading:'구획 제목',quote:'질문',label:'작은 라벨',lead:'본문',note:'설명',closing:'마무리 문장',primary:'주 버튼',secondary:'보조 버튼',more_label:'더 보기 버튼',caption:'이미지 설명',body:'본문',step:'단계 표시',kind:'구분'};
  const targetLabel = t => t.label || (t.kind === 'box' ? (t.key === 'section' ? '구획' : '카드 '+(t.path[1]+1)) : t.kind === 'image' ? '이미지' : (t.path[0] === 'items' ? '카드 '+(t.path[1]+1)+' · '+labels[t.path[2]] : labels[t.key]));
  const btn = {padding:'9px 14px', cursor:'pointer', border:'1px solid #ccd2df', borderRadius:6, background:'white', color:'#172033'};
  const Control = createClass({
    getInitialState() { return {open:false, html:'', selected:null, viewport:'desktop', error:'',panel:'selection',status:''}; },
    componentDidMount() { this.open(); },
    componentWillUnmount() { this.alive = false; if (this.stop) this.stop(); if(this.publishStop) this.publishStop(); },
    async open() {
      this.alive = true;
      this.mode = this.props.field.get('mode');
      activeCanvas=this;
      this.undoStack = []; this.redoStack = [];
      this.setState({open:true, html:'', selected:null, error:'',status:savedRoutes.has(location.hash) ? '저장 완료 · 홈페이지에 반영 중입니다.' : ''});
      try {
        this.base = clone(await window.HomePreview.ready);
        for(const [mode,value] of published) if(['site','home','navigation'].includes(mode)) this.base[mode]=clone(value);
        if (!this.alive) return;
        await new Promise(resolve => setTimeout(resolve,100));
        if (!this.alive) return;
        this.draft = this.read();
        if (['pages','posts'].includes(this.mode)) { this.draft.body ??= ''; this.draft.title ??= ''; }
        this.before = JSON.stringify(this.draft);
        this.refresh();
      } catch (error) { this.setState({error:error.message}); }
    },
    read() {
      const names = this.props.field.get('fieldnames').toArray();
      return Object.fromEntries(names.filter(name => controls.has(name)).map(name => [name,clone(controls.get(name).props.value)]));
    },
    syncDraft() {
      const immutable = value => Array.isArray(value) ? this.props.field.get('fieldnames').clear().push(...value.map(immutable)) : value && typeof value === 'object' ? this.props.field.clear().merge(Object.fromEntries(Object.entries(value).map(([k,v]) => [k,immutable(v)]))) : value;
      for (const name of this.props.field.get('fieldnames').toArray()) {
        const value=this.draft[name];
        const control = controls.get(name);
        if (control && JSON.stringify(clone(control.props.value)) !== JSON.stringify(value)) control.props.onChange(immutable(value));
      }
    },
    record() { this.undoStack.push(clone(this.draft)); if (this.undoStack.length > 60) this.undoStack.shift(); this.redoStack = []; },
    undo(redo) {
      const from = redo ? this.redoStack : this.undoStack, to = redo ? this.undoStack : this.redoStack;
      if (!from.length) return;
      to.push(clone(this.draft)); this.draft = from.pop(); this.syncDraft(); this.refresh();
    },
    publish() {
      this.syncDraft();
      this.setState({status:'게시 준비 중…'});
      setTimeout(() => {
        const button = [...document.querySelectorAll('button,[role="button"]')].find(b => b.textContent.trim() === '게시' && !b.closest('[data-canvas]'));
        if (button && !button.disabled) {
          pendingSave={mode:this.mode,route:location.hash};
          this.setState({status:'저장 중…'});
          button.click();
        }
        else this.setState({status:'변경사항이 없거나 입력 확인이 필요합니다. 양식 보기에서 게시 상태를 확인해 주세요.'});
      },200);
    },
    refresh() {
      const context = clone(this.base);
      for(const [mode,value] of published) if(['site','home','navigation'].includes(mode)) context[mode]=clone(value);
      const env = window.HomePreview.environment(context.templates);
      const markdown = window.markdownit({html:false,linkify:true});
      if (['home','site','navigation'].includes(this.mode)) context[this.mode] = clone(this.draft);
      context.page = {url:['pages','posts'].includes(this.mode) ? '/document-preview/' : '/'};
      let content;
      if (this.mode === 'pages' || this.mode === 'posts') {
        Object.assign(context,this.draft,{content:markdown.render(this.draft.body || '')});
        if(this.mode==='posts') context.date ||= new Date().toISOString();
        content = env.render(this.mode === 'pages' ? 'page.njk' : 'post.njk',context);
      } else content = window.HomePreview.assignTones(context.home.sections.filter(s => s.enabled !== false)).map(s => {
        if (s.type === 'richtext') s = {...s,body:markdown.render(s.body || '')};
        return env.render('sections/'+s.type+'.njk',{...context,s});
      }).join('');
      let html = env.render('base.njk',{...context,content});
      html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('<head>', '<head><base href="'+location.origin+'/"><style>html{scroll-behavior:auto}[data-document-body]:empty{min-height:120px;border:1px dashed #b8c5d8}[data-document-body]:empty:before{content:"클릭해서 본문을 입력하세요";color:#677080}[data-editable]:hover{outline:2px dashed #0075de;outline-offset:3px;cursor:text}[data-selected]{outline:2px solid #0075de!important;outline-offset:3px}[contenteditable]{white-space:pre-wrap!important}a,button{cursor:default}input,textarea{pointer-events:none}</style>');
      this.setState({html,selected:null});
    },
    mountFrame(event) {
      if (this.stop) this.stop();
      const doc = event.target.contentDocument;
      if(!doc?.body) return;
      const sections = this.mode === 'home' ? this.draft.sections || [] : [];
      const enabled = sections.map((s,i) => ({s,i})).filter(x => x.s.enabled !== false);
      window.VisualLayout.apply(doc);
      this.bound = [];
      doc.addEventListener('click', e => { if (e.target.closest('a,button')) e.preventDefault(); },true);
      doc.addEventListener('submit', e => e.preventDefault());
      const bind = target => {
        const owner = target.index != null ? this.draft.sections[target.index] : this.draft;
        if (['text','richtext'].includes(target.kind) && typeof get(owner,target.path) !== 'string' && target.initialText === undefined) return;
        if(target.kind==='text' && target.el.querySelector('img')) return;
        target.el.dataset.editable = target.key;
        this.bound.push(target);
        target.el.addEventListener('click',e => { e.stopPropagation(); this.select(target); });
        if (['text','richtext'].includes(target.kind)) {
          if (target.el.tagName === 'A') target.el.removeAttribute('href');
          if (target.kind !== 'richtext') target.el.querySelectorAll('a').forEach(a => a.removeAttribute('href'));
          target.el.setAttribute('contenteditable','plaintext-only');
          target.el.setAttribute('role','textbox');
          target.el.setAttribute('aria-label',(target.label || target.key)+' 직접 편집');
          target.el.addEventListener('focus',() => { if (target.kind === 'text') target.el.innerText = get(owner,target.path) ?? target.initialText; this.select(target); });
          target.el.addEventListener('input',() => {
            this.record();
            let value = target.el.innerText.replace(/\r/g,'');
            if (target.kind === 'richtext') {
              const copy = target.el.cloneNode(true);
              copy.querySelectorAll('[style],[contenteditable],[data-selected]').forEach(n => { n.removeAttribute('style'); n.removeAttribute('contenteditable'); n.removeAttribute('data-selected'); });
              value = new TurndownService({headingStyle:'atx'}).turndown(copy.innerHTML);
            }
            set(owner,target.path,value);
            this.bound.filter(x => x !== target && x.index === target.index && JSON.stringify(x.path) === JSON.stringify(target.path)).forEach(x => { x.el.innerText = value; });
            this.syncDraft();
            this.setState({selected:{...target,values:{...(appearanceOf(this.draft,target)[window.VisualLayout.styleKey(target)] || {})}}});
          });
        }
      };
      if (this.mode === 'home') doc.querySelectorAll('main > section').forEach((section,index) => {
        const source = enabled[index];
        if (!source) return;
        [...window.VisualLayout.targets(section),...window.VisualLayout.references(section)].forEach(target => {
          const owner = target.sourceId ? enabled.find(x => x.s.id === target.sourceId) : source;
          if (owner) bind({...target,index:owner.i});
        });
        if (source.s.type === 'richtext') {
          const body = section.querySelector('[data-document-body]');
          if (body) bind({key:'body',el:body,path:['body'],kind:'richtext',index:source.i,label:'自由 글 본문'.replace('自由','자유')});
        }
      });
      const add = (key,selector,path,label,kind = 'text') => {
        const el = doc.querySelector(selector);
        if (el) bind({key,el,path,label,kind});
      };
      if (this.mode === 'site') {
        add('header-box','header',[],'상단 영역','box');
        add('footer-box','footer',[],'푸터 영역','box');
        add('brand','header .brand',[['tesla','claude','notion','beagle'].includes(this.draft.theme) ? 'title_tag' : 'name'],'상단 사이트 이름');
        add('name','.notion-eyebrow,.hero-eyebrow',['name'],'이름');
        add('byline','footer .wrap > p:first-child',['byline'],'푸터 소개');
        add('copyright','footer .wrap > p:last-child',['copyright'],'저작권 문구');
        doc.querySelectorAll('[data-site-title]').forEach(el=>bind({key:'brand',el,path:['title_tag'],kind:'text',label:'사이트 이름'}));
        doc.querySelectorAll('footer a').forEach((el,i) => bind({key:'link-'+i,el,path:['links',i,'label'],kind:'text',label:'푸터 링크 '+(i+1)}));
      }
      if (this.mode === 'navigation') {
        add('navigation-box','header nav',[],'메뉴 영역','box');
        const shown = (this.draft.items || []).map((item,i)=>({item,i})).filter(x=>x.item.visible !== false);
        doc.querySelectorAll('header nav a').forEach((el,i) => { if (shown[i]) bind({key:'nav-'+shown[i].i,el,path:['items',shown[i].i,'label'],kind:'text',label:'메뉴 '+(i+1)}); });
      }
      if (this.mode === 'pages' || this.mode === 'posts') {
        add('hero-box','main > section:first-child',[],'제목 영역','box');
        add('body-box','main > section:last-child',[],'본문 영역','box');
        add('title','main h1',['title'],'제목');
        add('description','main .lead',[this.mode === 'pages' ? 'description' : 'summary'],'요약');
        add('body','[data-document-body]',['body'],'본문','richtext');
        doc.querySelectorAll('[data-document-body] img').forEach((el,i)=>bind({key:'document-image-'+i,el,path:[],kind:'image',label:'본문 이미지 '+(i+1)}));
      }
      // Every remaining visible text node belongs to this canvas draft.
      window.VisualLayout.textTargets(doc).forEach(target=>{
        if(target.el.closest('[contenteditable]')) return;
        const path=['appearance','canvasTexts',target.key,'text'];
        bind({...target,path,initialText:target.el.textContent,label:'선택한 텍스트'});
      });
      window.VisualLayout.apply(doc);
      this.stop = window.TextLayout.observe(doc);

    },
    select(target) {
      this.bound.forEach(x => delete x.el.dataset.selected);
      target.el.dataset.selected = 'true';
      this.selected = target;
      const values = appearanceOf(this.draft,target)[window.VisualLayout.styleKey(target)] || {};
      this.setState({selected:{...target, values:{...values}},panel:'selection'});
    },
    change(key,value) {
      const t = this.selected;
      if (!t) return;
      this.record();
      const appearance = appearanceOf(this.draft,t,true);
      const values = appearance[window.VisualLayout.styleKey(t)] ||= {};
      if (value === '') delete values[key]; else values[key] = value;
      this.bound.filter(x => x.index === t.index && x.key === t.key).forEach(x => {
        window.VisualLayout.reset(x);
        window.VisualLayout.style(x,values);
      });
      window.TextLayout.layout(t.el.ownerDocument);
      this.syncDraft();
      this.setState({selected:{...t,values:{...values}}});
    },
    close(apply) {
      if (this.stop) this.stop();
      if (!apply) { this.draft = JSON.parse(this.before); this.syncDraft(); }
      this.setState({open:false,html:'',selected:null});
    },
    render() {
      const modeNames = {home:'홈 화면',site:'기본 정보',navigation:'메뉴',pages:'페이지',posts:'글·소식'};
      const selected = this.state.selected;
      let linkPath;
      if(selected) {
        if(this.mode==='navigation' && selected.path?.[0]==='items') linkPath=['items',selected.path[1],'url'];
        if(this.mode==='site' && selected.path?.[0]==='links') linkPath=['links',selected.path[1],'url'];
        if(this.mode==='home' && ['primary','secondary'].includes(selected.path?.[0])) linkPath=[selected.path[0],'url'];
        if(this.mode==='home' && selected.key==='more_label') linkPath=['more_url'];
      }
      const owner=selected?.index != null ? this.draft.sections[selected.index] : this.draft;

      const field = (label, key, type, options) => h('label',{style:{display:'grid',gap:5,marginBottom:16}},label,
        type === 'select' ? h('select',{'aria-label':label,value:selected.values[key] || '',onChange:e => this.change(key,e.target.value),style:btn},
          h('option',{value:''},'테마 기본값'),...options.map(([value,text]) => h('option',{key:value,value},text))) :
          h('input',{'aria-label':label,type, value:selected.values[key] || (type === 'color' ? '#202020' : ''),min:key === 'size' ? 13 : 0,max:key === 'size' ? 100 : key === 'width' ? 100 : 1000,placeholder:'기본값',onChange:e => this.change(key,e.target.value),onInput:type === 'color' ? e => this.change(key,e.target.value) : undefined,style:{...btn,width:'100%',boxSizing:'border-box',height:type === 'color' ? 42 : undefined}}));
      return h('div',{},
        h('button',{type:'button',style:{...btn,background:'#0075de',color:'white',margin:'12px 0'},onClick:this.open},'화면 편집으로 돌아가기'),
        h('p',{style:{fontSize:13}},'화면의 요소를 클릭하면 초안에 반영됩니다. 변경사항 게시로 저장합니다.'),

        this.state.open ? h('div',{'data-canvas':'true',role:'region','aria-label':'홈페이지 화면 편집',style:{position:'fixed',inset:0,zIndex:10000,background:'#f4f5f7',display:'flex',flexDirection:'column',color:'#172033'}},
          h('div',{style:{padding:12,display:'flex',gap:12,alignItems:'center',background:'white',borderBottom:'1px solid #ddd',flexWrap:'wrap'}},
            h('strong',{},modeNames[this.mode]+' 편집'),
            h('button',{type:'button',style:btn,onClick:() => this.setState({viewport:'desktop'})},'PC'),
            h('button',{type:'button',style:btn,onClick:() => this.setState({viewport:'mobile'})},'휴대폰'),
            h('span',{style:{flex:1}},'글자 클릭 → 직접 입력 · 오른쪽에서 서식 조절'),
            h('button',{type:'button',style:btn,onClick:() => this.undo(false)},'되돌리기'),
            h('button',{type:'button',style:btn,onClick:() => this.undo(true)},'다시 실행'),
            h('button',{type:'button',style:btn,onClick:() => this.close(true)},'양식 보기'),
            h('button',{type:'button',style:{...btn,background:'#0075de',color:'white'},disabled:!this.state.html,onClick:this.publish},'변경사항 게시')),
          h('div',{style:{display:'flex',flex:1,minHeight:0}},
            h('div',{style:{flex:1,overflow:'auto',display:'flex',justifyContent:'center'}},this.state.html ? h('iframe',{title:'홈페이지 직접 편집',srcDoc:this.state.html,sandbox:'allow-same-origin',onLoad:this.mountFrame,style:{border:0,background:'white',width:this.state.viewport === 'mobile' ? 375 : '100%',height:'100%',maxWidth:'100%'}}) : h('p',{},this.state.error || '편집 화면을 불러오는 중…')),
            h('aside',{style:{width:420,minWidth:320,maxWidth:'55vw',flexShrink:0,resize:'horizontal',padding:24,overflow:'auto',background:'white',borderLeft:'1px solid #ddd'}},
              h('div',{style:{display:'flex',gap:8,marginBottom:16}},h('button',{type:'button',style:btn,onClick:()=>this.setState({panel:'selection'})},'선택 요소'),h('button',{type:'button',style:btn,disabled:!this.state.html,onClick:()=>this.setState({panel:'settings'})},'영역 설정')),
              this.state.panel === 'settings' ? h('div',{},...[...controls].filter(([name])=>name!=='appearance').map(([name,control]) => {
                const widgetName = control.props.field.get('widget').replace(/^canvas/,'');
                const widget = CMS.getWidget(widgetName);
                return h('div',{key:name,style:{marginBottom:20}},h('label',{htmlFor:control.props.forID+'-canvas'},control.props.field.get('label')),h(widget.control,{...control.props,forID:control.props.forID+'-canvas',field:control.props.field.set('widget',widgetName),value:control.props.value,onChange:value=>{ this.record(); this.draft[name]=clone(value); control.props.onChange(value); this.refresh(); }}));
              })) : selected ? h('div',{},h('h3',{},['text','richtext'].includes(selected.kind) ? '텍스트 편집' : '객체 크기'),h('p',{},targetLabel(selected)),
                ['text','richtext'].includes(selected.kind) ? h('label',{style:{display:'grid',gap:8,marginBottom:24}},selected.kind==='richtext' ? '본문 (마크다운)' : '내용',h('textarea',{'aria-label':'선택한 텍스트 내용',value:get(owner,selected.path) ?? selected.initialText ?? '',style:{...btn,width:'100%',minHeight:180,resize:'vertical',fontSize:17,lineHeight:1.7,boxSizing:'border-box'},onChange:e=>{this.record();set(owner,selected.path,e.target.value);this.syncDraft();if(selected.kind==='richtext') selected.el.innerHTML=window.markdownit({html:false,linkify:true}).render(e.target.value);else this.bound.filter(x=>x.index===selected.index && JSON.stringify(x.path)===JSON.stringify(selected.path)).forEach(x=>{x.el.innerText=e.target.value;});this.setState({selected:{...selected}});}})) : null,

                linkPath ? h('label',{style:{display:'grid',gap:6,marginBottom:16}},'링크 주소',h('input',{'aria-label':'링크 주소',value:get(owner,linkPath) || '',style:{...btn,width:'100%',boxSizing:'border-box'},onChange:e=>{this.record();set(owner,linkPath,e.target.value);this.syncDraft();this.setState({status:'링크를 초안에 반영했습니다.'});}})) : null,

                selected.index != null && this.bound.some(x=>x.index===selected.index && x.key==='section') ? h('button',{type:'button',style:btn,onClick:() => this.select(this.bound.find(x => x.index === selected.index && x.key === 'section'))},'구획 크기 선택') : null,
                selected.kind === 'text' && selected.path?.[0] === 'items' && this.bound.some(x => x.index === selected.index && x.key === 'card-'+selected.path[1]) ? h('button',{type:'button',style:btn,onClick:() => this.select(this.bound.find(x => x.index === selected.index && x.key === 'card-'+selected.path[1]))},'이 카드 크기 선택') : null,
                ...(['text','richtext'].includes(selected.kind) ? [field('글꼴','font','select',[['sans','고딕'],['serif','명조'],['mono','고정폭']]),field('글자 색상','color','color'),field('색상 코드 (#RRGGBB)','color','text'),field('글자 크기 (px)','size','number'),field('굵기','weight','select',[['400','보통'],['500','중간'],['600','굵게'],['700','매우 굵게']]),field('정렬','align','select',[['left','왼쪽'],['center','가운데'],['right','오른쪽']])] : [field('폭 (%)','width','number'),...(selected.kind === 'image' ? [] : [field('최소 높이 (px)','height','number'),field('안쪽 여백 (px)','padding','number')])]),
                h('button',{type:'button',style:btn,onClick:() => { Object.keys(selected.values).forEach(key => this.change(key,'')); }},'서식 초기화')) : h('p',{},'수정할 글자나 카드, 구획의 빈 곳을 클릭하세요. 이미지가 있는 구획에서는 이미지 폭도 조절할 수 있습니다.'),
              h('p',{style:{fontSize:12,lineHeight:1.6}},this.state.status || '변경사항 게시를 누르면 저장·배포합니다. 영역 설정에서 링크·검색 설명·표시 여부 등 모든 항목을 수정할 수 있습니다.')))) : null);
    }
  });
  CMS.registerWidget('visualcanvas',Control);
  // Existing bookmarks continue to work through the default canvas field.
  CMS.registerWidget('visualsections',CMS.getWidget('list').control,CMS.getWidget('list').preview,CMS.getWidget('list').schema);
})();
