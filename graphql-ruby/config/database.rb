# frozen_string_literal: true

require 'active_record'
require 'logger'

# Configuración de la base de datos
ActiveRecord::Base.logger = Logger.new($stdout)
ActiveRecord::Base.establish_connection(
  ENV.fetch('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/marketplace_db')
)

# Configurar zona horaria
ActiveRecord::Base.default_timezone = :utc
