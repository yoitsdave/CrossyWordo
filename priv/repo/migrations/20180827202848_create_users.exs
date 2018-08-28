defmodule Crossywordo.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do

      add :name, :string
      add :email, :string
      add :tier, :integer
      add :reset_to_free, :date
      add :oauth_token, :string

      timestamps()
    end

  end
end
