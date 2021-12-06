import winston from 'winston'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const getCodeLevel = () => {
  const env = process.argv.includes('--dev') ? 'development' : process.env.NODE_ENV
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}


const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
}


winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((content) => `${content.timestamp} ${content.level}: ${content.message}`,
  ),
)


const transports = [

  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({
      filename: 'logs/warn.log',
      level: 'warn'
  }),
  
  new winston.transports.File({ filename: 'logs/all.log' }),
]


const Logger = winston.createLogger({
  level: getCodeLevel(),
  levels,
  format,
  transports,
})

export default Logger