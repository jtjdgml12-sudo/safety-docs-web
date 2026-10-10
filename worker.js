import {loadPyodide} from './assets/pyodide/pyodide.mjs';
let runtime;
const ready = (async () => {
  runtime = await loadPyodide({indexURL:new URL('assets/pyodide/',location.href).href});
  await runtime.loadPackage(['numpy', 'pillow', 'micropip']);
  runtime.globals.set('reportlab_url',new URL('assets/reportlab-5.0.1-py3-none-any.whl',location.href).href);
  await runtime.runPythonAsync("import micropip\nawait micropip.install(reportlab_url, deps=False)");
  const response = await fetch('assets/runtime.zip');
  if (!response.ok) throw new Error('실행 자료를 불러오지 못했습니다.');
  runtime.unpackArchive(new Uint8Array(await response.arrayBuffer()), 'zip', {extractDir:'/runtime'});
  await runtime.runPythonAsync("import sys\nsys.path.insert(0,'/runtime')\nfrom bridge import dispatch");
  // No network access is needed after immutable assets are loaded.
  self.fetch = () => Promise.reject(new Error('Network disabled after initialization'));
})();
onmessage = async event => {
  const {id, request} = event.data;
  try {
    await ready;
    // Only local Worker messages: no network request contains form data.
    runtime.globals.set('browser_request', JSON.stringify(request));
    let result;
    try { result = JSON.parse(runtime.runPython('dispatch(browser_request)')); }
    finally { runtime.globals.delete('browser_request'); }
    postMessage({id,result});
  } catch (error) { postMessage({id,error:'처리에 실패했습니다. 입력값 또는 실행 자료를 확인해주세요.'}); }
};
