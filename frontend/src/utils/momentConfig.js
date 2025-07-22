import moment from 'moment';
import 'moment/locale/fr';
import 'moment-timezone';

moment.locale('fr');
moment.tz.setDefault('Africa/Nairobi'); // EAT is UTC+3, using Nairobi as the timezone
export default moment;