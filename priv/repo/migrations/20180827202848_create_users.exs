defmodule Crossywordo.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do

      add :uname, :string, primary_key: true
      add :email, :string
      add :tier, :integer
      add :reset_to_free, :date
      add :oauth_token, :string

      timestamps()
    end

  end
end
