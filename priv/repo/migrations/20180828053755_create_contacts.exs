defmodule Crossywordo.Repo.Migrations.CreateContacts do
  use Ecto.Migration

  def change do

    create table(:contacts, primary_key: false) do
      add :follower_id, references(:users, column: :uname, type: :string, on_delete: :nothing), primary_key: true
      add :following_id, references(:users, column: :uname, type: :string, on_delete: :nothing), primary_key: true
      add :status, :int

      timestamps()
    end

  end
end
