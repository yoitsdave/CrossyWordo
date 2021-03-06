defmodule Crossywordo.Puz do
  use Arc.Definition
  def __storage, do: Arc.Storage.Local

  # Include ecto support (requires package arc_ecto installed):
  # use Arc.Ecto.Definition

  @versions [:original, :jsond]

  # To add a thumbnail version:
  # @versions [:original, :thumb]

  # Override the bucket on a per definition basis:
  # def bucket do
  #   :custom_bucket_name
  # end

  # Whitelist file extensions:
  # def validate({file, _}) do
  #   ~w(.jpg .jpeg .gif .png) |> Enum.member?(Path.extname(file.file_name))
  # end

  def transform(:jsond, _) do
    IO.puts "transform called" <> inspect :code.priv_dir(:crossywordo)
    {"python", fn i, o -> [List.to_string(:code.priv_dir(:crossywordo))
                            <> "/puzpy/puz.py",
                           i, o] end}
   end

  # Override the persisted filenames:
  def filename(_version, {_file, scope}) do
    IO.puts scope
    scope <> ".json"
   end

  # Override the storage directory:
  def storage_dir(_version, {_file, _scope}) do
     List.to_string(:code.priv_dir(:crossywordo)) <> "/boards/"
  end

  # Provide a default URL if there hasn't been a file uploaded
  # def default_url(version, scope) do
  #   "/images/avatars/default_#{version}.png"
  # end

  # Specify custom headers for s3 objects
  # Available options are [:cache_control, :content_disposition,
  #    :content_encoding, :content_length, :content_type,
  #    :expect, :expires, :storage_class, :website_redirect_location]
  #
  # def s3_object_headers(version, {file, scope}) do
  #   [content_type: MIME.from_path(file.file_name)]
  # end
end
