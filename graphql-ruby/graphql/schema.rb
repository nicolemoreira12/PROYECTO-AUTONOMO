# frozen_string_literal: true

require 'graphql'
require_relative 'query_type'

# Schema principal de GraphQL para el Marketplace
class MarketplaceSchema < GraphQL::Schema
  query Types::QueryType

  # Configuración del schema
  max_depth 15
  max_complexity 500
  default_max_page_size 100

  # Rescue de errores
  rescue_from(ActiveRecord::RecordNotFound) do |err, obj, args, ctx, field|
    raise GraphQL::ExecutionError, "#{field.type.unwrap.graphql_name} not found"
  end

  rescue_from(StandardError) do |err, obj, args, ctx, field|
    raise GraphQL::ExecutionError, "An error occurred: #{err.message}"
  end

  # Lazy loading y optimizaciones
  use GraphQL::Dataloader
  use GraphQL::Pagination::Connections
  use GraphQL::Backtrace

  # Instrumentación para logging
  instrument :field, FieldInstrumentation.new

  # Introspección habilitada (deshabilitar en producción si es necesario)
  disable_introspection_entry_points unless ENV['RACK_ENV'] == 'development'
end

# Instrumentación personalizada para logging
class FieldInstrumentation
  def instrument(_type, field)
    old_resolve_proc = field.resolve_proc

    new_resolve_proc = lambda do |obj, args, ctx|
      start_time = Time.now
      result = old_resolve_proc.call(obj, args, ctx)
      duration = Time.now - start_time

      # Log solo para queries lentas (>100ms)
      if duration > 0.1 && ctx[:logger]
        ctx[:logger].warn "Slow query: #{field.name} took #{duration.round(3)}s"
      end

      result
    end

    field.redefine { resolve(new_resolve_proc) }
  end
end
