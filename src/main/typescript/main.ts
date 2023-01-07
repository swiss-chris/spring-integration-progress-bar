import {Form} from './page'
import {initializeDarkModeSwitcher} from './dark-mode';

// @ts-ignore
window.formSubmit = () => Form.submit();

initializeDarkModeSwitcher();
