export const APP_RUNNING = (message: string) => `APP running on port ${message}`;

export const RECORD_NOT_FOUND = (message: string) => `Registro whit id ${message} not found`;

export const ID_NOT_VALID = (message: string) => `ID  ${message} no valido`;

export const ROW_EXIST = () => `Row already exists`;

export const USER_NOT_EXIST = () => `User not foud`;

export const CREDENTIAL_NOT_VALID = () => `Credentials are not valid`;

export const CANT_CREATE_USER = () => `Can't create User - check server logs`;

export const CANT_CREATE_ENTITY = () => `Can't create entity - check server logs`;

export const NEED_VALID_ROLE = (message: string) => `User ${message} need a valid role`;

export const USER_EXIST = (message: string) => `User exists in DB ${message}`;

export const USER_INACTIVE = ()=> `User is inactive`;

export const TOKEN_NOT_VALID =()=> `Token not valid`;

export const EMAIL_NOT_VERIFIED = () => `Email not verified`;

export const IN = 'IN';
export const OUT = 'OUT';
export const ERROR = 'ERROR';

export const MONGOID_NOT_VALID = (message: string) => `${ message } is not a valid ID`


export const ACTIVE = 'ACTIVE';
export const DELETED = 'DELETED';
export const INACTIVE = 'INACTIVE';
