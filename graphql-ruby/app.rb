# frozen_string_literal: true

require 'dotenv/load'
require 'sinatra/base'
require 'sinatra/json'
require 'rack/cors'
require 'logger'
require_relative 'config/database'
require_relative 'graphql/schema'

# Servicio GraphQL principal
class GraphQLService < Sinatra::Base
  configure do
    set :port, ENV.fetch('GRAPHQL_PORT', 4000)
    set :bind, '0.0.0.0'
    set :logger, Logger.new($stdout)
    
    # Configurar CORS
    use Rack::Cors do
      allow do
        origins ENV.fetch('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
        resource '*',
                 headers: :any,
                 methods: %i[get post put delete options],
                 credentials: true,
                 max_age: 600
      end
    end
  end

  before do
    content_type :json
    logger.info "#{request.request_method} #{request.path}"
  end

  # Health check
  get '/health' do
    json(
      status: 'OK',
      service: 'GraphQL Service',
      timestamp: Time.now.iso8601,
      database: database_healthy? ? 'connected' : 'disconnected'
    )
  end

  # GraphQL endpoint principal
  post '/graphql' do
    query_string = params[:query]
    variables = params[:variables] || {}
    operation_name = params[:operationName]

    # Parse request body si viene como JSON
    if request.content_type&.include?('application/json')
      body = JSON.parse(request.body.read)
      query_string = body['query']
      variables = body['variables'] || {}
      operation_name = body['operationName']
    end

    result = MarketplaceSchema.execute(
      query_string,
      variables: variables,
      operation_name: operation_name,
      context: {
        current_user: nil, # Aquí puedes agregar autenticación
        logger: logger
      }
    )

    json result
  rescue JSON::ParserError => e
    status 400
    json(
      errors: [{ message: 'Invalid JSON in request body', details: e.message }]
    )
  rescue StandardError => e
    logger.error "GraphQL Error: #{e.message}"
    logger.error e.backtrace.join("\n")
    status 500
    json(
      errors: [{ message: 'Internal server error', details: e.message }]
    )
  end

  # GraphQL Playground/IDE (solo en desarrollo)
  get '/graphql' do
    return erb :playground if development?
    
    json(
      message: 'GraphQL endpoint',
      methods: ['POST'],
      url: '/graphql'
    )
  end

  # Endpoint para introspección del schema
  get '/schema' do
    json MarketplaceSchema.to_definition
  end

  # 404 handler
  not_found do
    json(
      error: 'Endpoint not found',
      available_endpoints: {
        health: 'GET /health',
        graphql: 'POST /graphql',
        playground: 'GET /graphql (development only)',
        schema: 'GET /schema'
      }
    )
  end

  # Error handler global
  error do |e|
    logger.error "Error: #{e.message}"
    logger.error e.backtrace.join("\n")
    json(
      error: 'Internal server error',
      message: development? ? e.message : 'Something went wrong'
    )
  end

  private

  def database_healthy?
    ActiveRecord::Base.connection.active?
  rescue StandardError
    false
  end
end

# Iniciar servidor si se ejecuta directamente
if __FILE__ == $PROGRAM_NAME
  GraphQLService.run!
end
