(function () {
  const Control = createClass({
    render() {
      const value = Number(this.props.value) || 100;
      const change = amount => this.props.onChange(Math.max(70, Math.min(140, value + amount)));
      const buttonStyle = { padding:'8px 14px', border:'1px solid #ccd2df', borderRadius:'5px', background:'#fff', cursor:'pointer' };
      return h('div', { id:this.props.forID, style:{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', padding:'12px' } },
        h('button', { type:'button', style:buttonStyle, disabled:value <= 70, onClick:() => change(-5), 'aria-label':'글자 작게' }, '작게 −'),
        h('output', { 'aria-live':'polite' }, value + '%'),
        h('button', { type:'button', style:buttonStyle, disabled:value >= 140, onClick:() => change(5), 'aria-label':'글자 크게' }, '크게 ＋'),
        h('button', { type:'button', style:buttonStyle, onClick:() => this.props.onChange(100) }, '기본 크기'),
        h('span', { style:{ fontSize:'12px', color:'#596475' } }, '화면에 표시되는 기본 크기의 70–140%'));
    }
  });
  CMS.registerWidget('textscale', Control, props => h('span', {}, (props.value || 100) + '%'));
  CMS.registerWidget('autofit', createClass({
    render() {
      const enabled = this.props.value !== false;
      return h('button', { type:'button', id:this.props.forID, role:'switch', 'aria-checked':enabled,
        onClick:() => this.props.onChange(!enabled), style:{ margin:'12px', padding:'10px 16px' } },
      enabled ? '자동 맞춤 켜짐' : '자동 맞춤 꺼짐');
    }
  }), props => h('span', {}, props.value !== false ? '자동 맞춤' : '자연스러운 줄바꿈'));
})();
