/* Decap custom list widget: draft changes use the normal CMS save/publish path. */
(function () {
  const clone = value => JSON.parse(JSON.stringify(value?.toJS ? value.toJS() : value || []));
  const get = (object, path) => path.reduce((v,k) => v?.[k], object);
  const set = (object, path, value) => { const last = path[path.length-1]; path.slice(0,-1).forEach(k => { object = object[k] ||= {}; }); object[last] = value; };
  const appearanceOf = (draft,target,create = false) => {
    const section = draft[target.index];
    const owner = target.path?.[0] === 'items' ? section.items[target.path[1]] : section;
    return owner.appearance || (create ? (owner.appearance = {}) : {});
  };
  const labels = {title:'큰 제목',heading:'구획 제목',quote:'질문',label:'작은 라벨',lead:'본문',note:'설명',closing:'마무리 문장',primary:'주 버튼',secondary:'보조 버튼',more_label:'더 보기 버튼',caption:'이미지 설명',body:'본문',step:'단계 표시',kind:'구분'};
  const targetLabel = t => t.kind === 'box' ? (t.key === 'section' ? '구획' : '카드 '+(t.path[1]+1)) : t.kind === 'image' ? '이미지' : (t.path[0] === 'items' ? '카드 '+(t.path[1]+1)+' · '+labels[t.path[2]] : labels[t.key]);
  const btn = {padding:'9px 14px', cursor:'pointer', border:'1px solid #ccd2df', borderRadius:6, background:'white', color:'#172033'};
  const Control = createClass({
    getInitialState() { return {open:false, html:'', selected:null, viewport:'desktop', error:''}; },
    componentWillUnmount() { this.alive = false; if (this.stop) this.stop(); },
    async open() {
      this.alive = true;
      this.draft = clone(this.props.value);
      this.before = JSON.stringify(this.draft);
      this.setState({open:true, html:'', selected:null, error:''});
      try {
        this.base = await window.HomePreview.ready;
        if (!this.alive) return;
        this.refresh();
      } catch (error) { this.setState({error:error.message}); }
    },
    refresh() {
      const context = clone(this.base);
      context.home.sections = this.draft;
      context.page = {url:'/'};
      const env = window.HomePreview.environment(context.templates);
      const markdown = window.markdownit({html:false, linkify:true});
      const content = window.HomePreview.assignTones(this.draft.filter(s => s.enabled !== false)).map(s => {
        if (s.type === 'richtext') s = {...s, body:markdown.render(s.body || '')};
        return env.render('sections/'+s.type+'.njk',{...context,s});
      }).join('');
      let html = env.render('base.njk',{...context, content});
      html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('<head>', '<head><base href="'+location.origin+'/"><style>html{scroll-behavior:auto}[data-editable]:hover{outline:2px dashed #0075de;outline-offset:3px;cursor:text}[data-selected]{outline:2px solid #0075de!important;outline-offset:3px}[contenteditable]{white-space:pre-wrap!important}a,button{cursor:default}input,textarea{pointer-events:none}</style>');
      this.setState({html});
    },
    mountFrame(event) {
      if (this.stop) this.stop();
      const doc = event.target.contentDocument;
      const enabled = this.draft.map((s,i) => ({s,i})).filter(x => x.s.enabled !== false);
      this.bound = [];
      doc.addEventListener('click', e => { if (e.target.closest('a,button') && !e.target.closest('[contenteditable]')) e.preventDefault(); },true);
      doc.addEventListener('submit', e => e.preventDefault());
      doc.querySelectorAll('main > section').forEach((section,index) => {
        const source = enabled[index];
        if (!source) return;
        [...window.VisualLayout.targets(section),...window.VisualLayout.references(section)].forEach(target => {
          const owner = target.sourceId ? enabled.find(x => x.s.id === target.sourceId) : source;
          if (!owner) return;
          if (target.kind === 'text' && typeof get(owner.s,target.path) !== 'string') return;
          target.index = owner.i;
          target.el.dataset.editable = target.key;
          this.bound.push(target);
          target.el.addEventListener('click', e => { e.stopPropagation(); this.select(target); });
          if (target.kind === 'text') {
            if (target.el.tagName === 'A') target.el.removeAttribute('href');
            target.el.querySelectorAll('a').forEach(a => a.removeAttribute('href'));
            target.el.setAttribute('contenteditable','plaintext-only');
            target.el.setAttribute('role','textbox');
            target.el.setAttribute('aria-label',target.key+' 직접 편집');
            target.el.addEventListener('focus', () => { target.el.innerText = get(this.draft[target.index],target.path); this.select(target); });
            target.el.addEventListener('paste', e => {
              e.preventDefault();
              const text = e.clipboardData.getData('text/plain');
              const selection = doc.getSelection();
              if (selection.rangeCount) { const range = selection.getRangeAt(0); range.deleteContents(); const node = doc.createTextNode(text); range.insertNode(node); range.setStartAfter(node); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); target.el.dispatchEvent(new doc.defaultView.Event('input')); }
            });
            target.el.addEventListener('input', () => {
              const value = target.el.innerText.replace(/\r/g,'');
              set(this.draft[target.index],target.path,value);
              this.bound.filter(x => x !== target && x.index === target.index && x.key === target.key).forEach(x => { x.el.innerText = value; });
            });
          }
        });
      });
      window.VisualLayout.apply(doc);
      this.stop = window.TextLayout.observe(doc);

    },
    select(target) {
      this.bound.forEach(x => delete x.el.dataset.selected);
      target.el.dataset.selected = 'true';
      this.selected = target;
      const values = appearanceOf(this.draft,target)[window.VisualLayout.styleKey(target)] || {};
      this.setState({selected:{...target, values:{...values}}});
    },
    change(key,value) {
      const t = this.selected;
      if (!t) return;
      const appearance = appearanceOf(this.draft,t,true);
      const values = appearance[window.VisualLayout.styleKey(t)] ||= {};
      if (value === '') delete values[key]; else values[key] = value;
      // Clear prior inline properties before applying the current complete selection.
      ['font-family','font-size','color','font-weight','text-align','width','max-width','min-height','padding'].forEach(p => t.el.style.removeProperty(p));
      delete t.el.dataset.visualSize;
      this.bound.filter(x => x.index === t.index && x.key === t.key).forEach(x => {
        if (x !== t) { ['font-family','font-size','color','font-weight','text-align','width','max-width','min-height','padding'].forEach(p => x.el.style.removeProperty(p)); delete x.el.dataset.visualSize; }
        window.VisualLayout.style(x,values);
      });
      window.TextLayout.layout(t.el.ownerDocument);
      this.setState({selected:{...t,values:{...values}}});
    },
    close(apply) {
      if (this.stop) this.stop();
      this.alive = false;
      if (apply && JSON.stringify(this.draft) !== this.before) {
        const immutable = value => Array.isArray(value) ? this.props.value.clear().push(...value.map(immutable)) : value && typeof value === 'object' ? this.props.field.clear().merge(Object.fromEntries(Object.entries(value).map(([k,v]) => [k,immutable(v)]))) : value;
        this.props.onChange(immutable(this.draft));
      }
      this.setState({open:false,html:'',selected:null});
    },
    render() {
      const list = CMS.getWidget('list').control;
      const selected = this.state.selected;
      const field = (label, key, type, options) => h('label',{style:{display:'grid',gap:5,marginBottom:16}},label,
        type === 'select' ? h('select',{'aria-label':label,value:selected.values[key] || '',onChange:e => this.change(key,e.target.value),style:btn},
          h('option',{value:''},'테마 기본값'),...options.map(([value,text]) => h('option',{key:value,value},text))) :
          h('input',{'aria-label':label,type, value:selected.values[key] || (type === 'color' ? '#202020' : ''),min:key === 'size' ? 13 : 0,max:key === 'size' ? 100 : key === 'width' ? 100 : 1000,placeholder:'기본값',onChange:e => this.change(key,e.target.value),onInput:type === 'color' ? e => this.change(key,e.target.value) : undefined,style:{...btn,width:'100%',boxSizing:'border-box',height:type === 'color' ? 42 : undefined}}));
      return h('div',{},
        h('button',{type:'button',style:{...btn,background:'#0075de',color:'white',margin:'12px 0'},onClick:this.open},'홈페이지 화면에서 편집'),
        h('p',{style:{fontSize:13}},'글자를 클릭해 수정하거나, 카드·구획을 클릭해 크기를 조절하세요. 초안에 적용한 다음 게시합니다.'),
        h(list,{...this.props,field:this.props.field.set('widget','list')}),
        this.state.open ? h('div',{role:'dialog','aria-modal':true,'aria-label':'홈페이지 화면 편집',style:{position:'fixed',inset:0,zIndex:10000,background:'#f4f5f7',display:'flex',flexDirection:'column',color:'#172033'}},
          h('div',{style:{padding:12,display:'flex',gap:12,alignItems:'center',background:'white',borderBottom:'1px solid #ddd',flexWrap:'wrap'}},
            h('strong',{},'홈페이지 화면 편집'),
            h('button',{type:'button',style:btn,onClick:() => this.setState({viewport:'desktop'})},'PC'),
            h('button',{type:'button',style:btn,onClick:() => this.setState({viewport:'mobile'})},'휴대폰'),
            h('span',{style:{flex:1}},'글자 클릭 → 직접 입력 · 오른쪽에서 서식 조절'),
            h('button',{type:'button',style:btn,onClick:() => this.close(false)},'취소'),
            h('button',{type:'button',style:{...btn,background:'#0075de',color:'white'},onClick:() => this.close(true)},'초안에 적용')),
          h('div',{style:{display:'flex',flex:1,minHeight:0}},
            h('div',{style:{flex:1,overflow:'auto',display:'flex',justifyContent:'center'}},this.state.html ? h('iframe',{title:'홈페이지 직접 편집',srcDoc:this.state.html,sandbox:'allow-same-origin',onLoad:this.mountFrame,style:{border:0,background:'white',width:this.state.viewport === 'mobile' ? 375 : '100%',height:'100%',maxWidth:'100%'}}) : h('p',{},this.state.error || '편집 화면을 불러오는 중…')),
            h('aside',{style:{width:230,padding:20,overflow:'auto',background:'white',borderLeft:'1px solid #ddd'}},
              selected ? h('div',{},h('h3',{},selected.kind === 'text' ? '글자 서식' : '객체 크기'),h('p',{},targetLabel(selected)),
                h('button',{type:'button',style:btn,onClick:() => this.select(this.bound.find(x => x.index === selected.index && x.key === 'section'))},'구획 크기 선택'),
                selected.kind === 'text' && selected.path?.[0] === 'items' && this.bound.some(x => x.index === selected.index && x.key === 'card-'+selected.path[1]) ? h('button',{type:'button',style:btn,onClick:() => this.select(this.bound.find(x => x.index === selected.index && x.key === 'card-'+selected.path[1]))},'이 카드 크기 선택') : null,
                ...(selected.kind === 'text' ? [field('글꼴','font','select',[['sans','고딕'],['serif','명조'],['mono','고정폭']]),field('글자 색상','color','color'),field('색상 코드 (#RRGGBB)','color','text'),field('글자 크기 (px)','size','number'),field('굵기','weight','select',[['400','보통'],['500','중간'],['600','굵게'],['700','매우 굵게']]),field('정렬','align','select',[['left','왼쪽'],['center','가운데'],['right','오른쪽']])] : [field('폭 (%)','width','number'),...(selected.kind === 'image' ? [] : [field('최소 높이 (px)','height','number'),field('안쪽 여백 (px)','padding','number')])]),
                h('button',{type:'button',style:btn,onClick:() => { Object.keys(selected.values).forEach(key => this.change(key,'')); }},'서식 초기화')) : h('p',{},'수정할 글자나 카드, 구획의 빈 곳을 클릭하세요. 이미지가 있는 구획에서는 이미지 폭도 조절할 수 있습니다.'),
              h('p',{style:{fontSize:12,lineHeight:1.6}},'초안에 적용 후 관리자 상단의 게시 버튼을 누르면 홈페이지에 반영됩니다. 취소하면 이번 화면 편집을 버립니다.')))) : null);
    }
  });
  CMS.registerWidget('visualappearance', createClass({render() {return h('p',{},'서식은 위의 “홈페이지 화면에서 편집”에서 조절합니다.');}}));
  CMS.registerWidget('visualsections',Control, CMS.getWidget('list').preview, CMS.getWidget('list').schema);
})();
