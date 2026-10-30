# 1. Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FilaceroAPI.csproj", "./"]
RUN dotnet restore "FilaceroAPI.csproj"
COPY . .
RUN dotnet publish -c Release -o /app/publish

# 2. Etapa de ejecución final
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render asigna dinámicamente un puerto, configuramos el listener para el puerto 8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "FilaceroAPI.dll"]