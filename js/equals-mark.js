<script>
(function () {
  // 把普通文本节点中的 ==...== 包成 <mark>，避开 code/pre/Katex/MathJax 等
  function markEquals(root) {
    const skipSelectors = [
      'pre', 'code', 'kbd', 'samp', 'var', '.highlight', '.hljs',
      '.gist', '.gutter', 'mjx-container', '.MathJax', '.katex'
    ].join(',');

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || node.nodeValue.indexOf('==') === -1) return NodeFilter.FILTER_REJECT;
        if (node.parentElement && node.parentElement.closest(skipSelectors)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    const re = /==([^=\n][\s\S]*?)==/g; // 不跨行，避免贪婪
    nodes.forEach(text => {
      let s = text.nodeValue, last = 0, m;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let touched = false;

      while ((m = re.exec(s)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        const mk = document.createElement('mark');
        mk.className = 'equals-mark';
        mk.textContent = m[1];
        frag.appendChild(mk);
        last = m.index + m[0].length;
        touched = true;
      }
      if (!touched) return;
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      text.parentNode.replaceChild(frag, text);
    });
  }

  function run() { markEquals(document.body); }

  // 尽量等数学引擎完成后再执行，避免动到 $...$ 内的东西
  if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
    MathJax.startup.promise.then(run);
  } else if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise().then(run).catch(run);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
      window.addEventListener('load', run);
    } else {
      run();
    }
  }
})();
</script>
